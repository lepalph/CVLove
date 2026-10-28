import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { detectLang } from './i18n/ui'
import { DEFAULT_DESIGN, emptyCV } from './model/cv'
import { blankCV, duplicateDoc, freeName, migrateV1, newCVDoc, parseImport, patchDoc } from './model/documents'
import { blankLetter, letterDesignFrom, letterFromCV, newLetterDoc } from './model/letter'
import { sampleCV } from './model/sample'
import type { CV, CVDoc, Design, Doc, EditorMode, Lang, Letter, LetterDoc } from './model/types'
import { getTemplate } from './templates'

interface State {
  documents: Doc[]
  activeId: string
  uiLang: Lang
  /** Applique une fonction pure de model/cv.ts au CV du document actif. */
  update: (fn: (cv: CV) => CV) => void
  /** Modifie le design du document actif (un modèle choisi = `{ ...preset, templateId }`). */
  updateDesign: (patch: Partial<Design>) => void
  setUiLang: (l: Lang) => void
  /** Mode guidé / complet du document actif (mémorisé avec lui, sans toucher à sa date de modification). */
  setEditorMode: (m: EditorMode) => void
  clearAll: () => void
  loadSample: () => void
  /** Remplace le contenu et le design du document actif par le premier CV du fichier. */
  importJson: (json: string) => void
  /** Lettre du document actif (voir `selectLetterDoc`). */
  updateLetter: (fn: (l: Letter) => Letter) => void
  updateLetterDesign: (patch: Partial<Design>) => void
  setLetterMode: (m: EditorMode) => void
  /** Crée une lettre (expéditeur copié du CV `cvId`, sinon vierge), la rend active et renvoie son id. */
  createLetter: (cvId?: string) => string
  // Mes documents
  openDoc: (id: string) => void
  createCV: () => string
  duplicate: (id: string) => void
  rename: (id: string, name: string) => void
  remove: (id: string) => void
  /** Ajoute les documents d'un fichier JSON ; renvoie leur nombre. */
  importDocs: (json: string) => number
}

const initialLang = detectLang()
const first = newCVDoc('CV', sampleCV(initialLang)) // données d'exemple pour démarrer

/** CV du document actif ; si c'est une lettre, le premier CV (l'éditeur de CV ne gère que les CV). */
export const selectCvDoc = (s: Pick<State, 'documents' | 'activeId'>): CVDoc =>
  (s.documents.find((d) => d.id === s.activeId && d.kind === 'cv') ?? s.documents.find((d) => d.kind === 'cv')) as CVDoc

export const useCvDoc = () => useStore(selectCvDoc)

/** Lettre du document actif ; si c'est un CV, la première lettre (absente : undefined). */
export const selectLetterDoc = (s: Pick<State, 'documents' | 'activeId'>): LetterDoc | undefined =>
  (s.documents.find((d) => d.id === s.activeId && d.kind === 'letter') ?? s.documents.find((d) => d.kind === 'letter')) as LetterDoc | undefined

export const useLetterDoc = () => useStore(selectLetterDoc)

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const patchActive = (patch: (d: CVDoc) => Partial<CVDoc>) =>
        set((s) => {
          const d = selectCvDoc(s)
          return { documents: patchDoc(s.documents, d.id, { ...patch(d), updatedAt: Date.now() }) }
        })
      const patchLetterDoc = (patch: (d: LetterDoc) => Partial<LetterDoc>, touch = true) =>
        set((s) => {
          const d = selectLetterDoc(s)
          return d ? { documents: patchDoc(s.documents, d.id, { ...patch(d), ...(touch ? { updatedAt: Date.now() } : {}) }) } : s
        })
      return {
        documents: [first],
        activeId: first.id,
        uiLang: initialLang,
        update: (fn) => patchActive((d) => ({ data: fn(d.data) })),
        updateDesign: (patch) => patchActive((d) => ({ design: { ...d.design, ...patch } })),
        setUiLang: (uiLang) => set({ uiLang }),
        setEditorMode: (editorMode) => set((s) => ({ documents: patchDoc(s.documents, selectCvDoc(s).id, { editorMode }) })),
        clearAll: () => patchActive((d) => ({ data: emptyCV(d.data.lang) })),
        loadSample: () => patchActive((d) => ({ data: sampleCV(d.data.lang) })),
        importJson: (json) => {
          const imported = parseImport(json).find((d) => d.kind === 'cv') as CVDoc | undefined
          if (!imported) throw new Error('invalid')
          patchActive(() => ({ data: imported.data, design: imported.design }))
        },
        updateLetter: (fn) => patchLetterDoc((d) => ({ data: fn(d.data) })),
        updateLetterDesign: (patch) => patchLetterDoc((d) => ({ design: { ...d.design, ...patch } })),
        setLetterMode: (editorMode) => patchLetterDoc(() => ({ editorMode }), false),
        createLetter: (cvId) => {
          const s = get()
          const src = s.documents.find((d): d is CVDoc => d.id === cvId && d.kind === 'cv')
          const name = freeName(s.documents, 'Lettre')
          const doc = src
            ? newLetterDoc(name, letterFromCV(src.data), letterDesignFrom(src.design, getTemplate(src.design.templateId).category))
            : newLetterDoc(name, blankLetter(s.uiLang), { ...DEFAULT_DESIGN, templateId: 'lettre-classique' })
          set((st) => ({ documents: [...st.documents, doc], activeId: doc.id }))
          return doc.id
        },
        openDoc: (id) => set({ activeId: id }),
        createCV: () => {
          const doc = newCVDoc(freeName(get().documents, 'CV'), blankCV(get().uiLang), selectCvDoc(get()).design)
          set((s) => ({ documents: [...s.documents, doc], activeId: doc.id }))
          return doc.id
        },
        duplicate: (id) =>
          set((s) => {
            const src = s.documents.find((d) => d.id === id)
            if (!src) return s
            const copy = duplicateDoc(src, freeName(s.documents, src.name))
            return { documents: [...s.documents, copy], activeId: copy.id }
          }),
        rename: (id, name) => set((s) => ({ documents: patchDoc(s.documents, id, { name: name.trim() || 'CV' }) })),
        remove: (id) =>
          set((s) => {
            let documents = s.documents.filter((d) => d.id !== id)
            if (!documents.some((d) => d.kind === 'cv')) documents = [...documents, newCVDoc('CV', blankCV(s.uiLang))] // jamais sans CV
            const activeId = documents.some((d) => d.id === s.activeId) ? s.activeId : documents[0].id
            return { documents, activeId }
          }),
        importDocs: (json) => {
          const docs = parseImport(json)
          set((s) => ({ documents: [...s.documents, ...docs] }))
          return docs.length
        },
      }
    },
    {
      name: 'cvlove:v2',
      version: 2,
      partialize: (s) => ({ documents: s.documents, activeId: s.activeId, uiLang: s.uiLang }),
      // Premier lancement en v2 : le stockage v1 (`cvlove:v1`) est converti à la lecture et laissé en place (filet de sécurité).
      storage: {
        ...createJSONStorage(() => localStorage)!,
        getItem: (name) => {
          try {
            const raw = localStorage.getItem(name)
            if (raw) return JSON.parse(raw)
            const v1 = localStorage.getItem('cvlove:v1')
            return v1 ? { state: migrateV1(JSON.parse(v1).state), version: 2 } : null
          } catch {
            return null
          }
        },
      },
    },
  ),
)

// Hydratation synchrone (localStorage) : on réécrit tout de suite, pour que le stockage v2 existe dès la migration depuis la v1.
useStore.setState({})
