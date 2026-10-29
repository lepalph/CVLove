import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { detectLang } from './i18n/ui'
import { DEFAULT_DESIGN, applyDesignPatch, emptyCV } from './model/cv'
import { blankCV, duplicateDoc, followName, freeName, migrateV1, newCVDoc, parseImport, patchDoc, untitledName } from './model/documents'
import { blankLetter, letterDesignFrom, letterFromCV, newLetterDoc } from './model/letter'
import { sampleCV, type SampleProfile } from './model/sample'
import { sanitizeState } from './model/sanitize'
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
  loadSample: (profile?: SampleProfile) => void
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
const first = newCVDoc(untitledName(initialLang), blankCV(initialLang)) // page vide ; l'exemple se charge à la demande (loadSample)

/** CV du document actif ; si c'est une lettre, le premier CV (l'éditeur de CV ne gère que les CV). */
export const selectCvDoc = (s: Pick<State, 'documents' | 'activeId'>): CVDoc =>
  (s.documents.find((d) => d.id === s.activeId && d.kind === 'cv') ?? s.documents.find((d) => d.kind === 'cv')) as CVDoc

export const useCvDoc = () => useStore(selectCvDoc)

/** Lettre du document actif ; si c'est un CV, la première lettre (absente : undefined). */
export const selectLetterDoc = (s: Pick<State, 'documents' | 'activeId'>): LetterDoc | undefined =>
  (s.documents.find((d) => d.id === s.activeId && d.kind === 'letter') ?? s.documents.find((d) => d.kind === 'letter')) as LetterDoc | undefined

export const useLetterDoc = () => useStore(selectLetterDoc)

/** Résultat de la dernière écriture dans localStorage : `error` = stockage plein ou refusé (la saisie reste en mémoire). */
export const useSaveStatus = create<{ error: 'quota' | 'unavailable' | null }>(() => ({ error: null }))

const safe = <T,>(fn: () => T): T | null => {
  try { return fn() } catch { return null }
}
let pending: { name: string; value: string } | null = null
let timer: ReturnType<typeof setTimeout>

/** Écrit tout de suite l'état en attente (appelé après 500 ms de calme, à la fermeture de la page et au démarrage). */
export function flushSave() {
  clearTimeout(timer)
  if (!pending) return
  const { name, value } = pending
  try {
    localStorage.setItem(name, value)
    pending = null
    localStorage.removeItem('cvlove:v1') // migré : le doublon (photo comprise) ne doit pas remplir le quota
    if (useSaveStatus.getState().error) useSaveStatus.setState({ error: null })
  } catch (e) {
    useSaveStatus.setState({ error: e instanceof DOMException && e.name === 'QuotaExceededError' ? 'quota' : 'unavailable' })
  }
}
/** Efface les données locales, sans écriture en attente qui les ressusciterait à la fermeture de la page. */
export function wipeStorage() {
  clearTimeout(timer)
  pending = null
  for (const k of ['cvlove:v2', 'cvlove:v1']) safe(() => localStorage.removeItem(k))
}
addEventListener('pagehide', flushSave)
addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flushSave())

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const patchActive = (patch: (d: CVDoc) => Partial<CVDoc>) =>
        set((s) => {
          const d = selectCvDoc(s)
          const p = patch(d)
          return { documents: patchDoc(s.documents, d.id, { ...p, ...(p.data ? { name: followName(d, p.data, s.uiLang) } : {}), updatedAt: Date.now() }) }
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
        updateDesign: (patch) => patchActive((d) => ({ design: applyDesignPatch(d.design, patch) })),
        setUiLang: (uiLang) => set({ uiLang }),
        setEditorMode: (editorMode) => set((s) => ({ documents: patchDoc(s.documents, selectCvDoc(s).id, { editorMode }) })),
        clearAll: () => patchActive((d) => ({ data: emptyCV(d.data.lang) })),
        loadSample: (profile) => patchActive((d) => ({ data: sampleCV(d.data.lang, profile) })),
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
          const doc = newCVDoc(freeName(get().documents, untitledName(get().uiLang)), blankCV(get().uiLang), selectCvDoc(get()).design)
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
            if (!documents.some((d) => d.kind === 'cv')) documents = [...documents, newCVDoc(untitledName(s.uiLang), blankCV(s.uiLang))] // jamais sans CV
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
      storage: {
        // Lecture : toujours un état valide (voir model/sanitize.ts). JSON illisible : copie brute dans `cvlove:corrupt`, on repart d'un CV vierge.
        getItem: (name) => {
          const raw = safe(() => localStorage.getItem(name))
          try {
            // Premier lancement en v2 : le stockage v1 (`cvlove:v1`) est converti à la lecture, puis supprimé après la première écriture v2 réussie.
            const v1 = raw ? null : safe(() => localStorage.getItem('cvlove:v1'))
            if (!raw && !v1) return null
            const state = raw ? JSON.parse(raw).state : migrateV1(JSON.parse(v1!).state)
            return { state: sanitizeState(state, () => newCVDoc(untitledName(detectLang()), blankCV(detectLang()))), version: 2 }
          } catch {
            if (raw) safe(() => localStorage.setItem('cvlove:corrupt', raw))
            return null
          }
        },
        // Écriture différée (500 ms) : la sérialisation de tous les documents ne se fait pas à chaque frappe.
        setItem: (name, value) => {
          pending = { name, value: JSON.stringify(value) }
          clearTimeout(timer)
          timer = setTimeout(flushSave, 500)
        },
        removeItem: (name) => safe(() => localStorage.removeItem(name)),
      },
    },
  ),
)

// Hydratation synchrone (localStorage) : on réécrit tout de suite, pour que le stockage v2 existe dès la migration depuis la v1.
useStore.setState({})
flushSave()
