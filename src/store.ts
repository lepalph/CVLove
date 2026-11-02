import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { detectLang } from './i18n/ui'
import { DEFAULT_DESIGN, applyDesignPatch, emptyCV } from './model/cv'
import { blankCV, draftCVDoc, duplicateDoc, followName, freeName, migrateV1, newCVDoc, parseImport, patchDoc, untitledName } from './model/documents'
import { blankLetter, letterDesignFrom, letterFromCV, newLetterDoc } from './model/letter'
import { sampleCV, type SampleProfile } from './model/sample'
import { sanitizeState } from './model/sanitize'
import { restoreSnap, type Snap } from './model/undo'
import { LANGS, type CV, type CVDoc, type Design, type Doc, type EditorMode, type Lang, type Letter, type LetterDoc } from './model/types'
import { getTemplate } from './templates'
import { isEmptyCV } from './ui/lib'

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
  /** Remplace le contenu du document `id` par `src` (même type), en gardant son identifiant ; false si ce document n'existe plus. */
  replaceDoc: (id: string, src: Doc) => boolean
  /** Ajoute les documents d'un fichier JSON ; renvoie leur nombre. */
  importDocs: (json: string) => number
}

const initialLang = detectLang()
const first = draftCVDoc(initialLang) // page vide, brouillon ; l'exemple se charge à la demande (loadSample)

/** Brouillon jamais rempli : invisible dans Mes documents, jamais exporté ni écrit. Il cesse d'être un brouillon à la première saisie, photo ou choix de design. */
export const isBlankDraft = (d: Doc) => !!d.draft && d.kind === 'cv' && isEmptyCV(d.data) && !d.data.personal.photo
/** Retire les brouillons vierges dès qu'un autre CV existe (ils ne servaient qu'à ne jamais rester sans CV). */
const dropBlankDrafts = (docs: Doc[]) => {
  const kept = docs.filter((d) => !isBlankDraft(d))
  return kept.some((d) => d.kind === 'cv') ? kept : docs
}

/** Le brouillon vierge suit la langue de l'interface (sinon : interface en français, sections « Work experience »). Un CV choisi garde la sienne. */
const alignBlank = (docs: Doc[], lang: Lang) =>
  docs.map((d) => (d.kind === 'cv' && d.data.lang !== lang && isBlankDraft(d) ? { ...d, data: { ...d.data, lang } } : d))

/** CV du document actif ; si c'est une lettre, le premier CV (l'éditeur de CV ne gère que les CV). */
export const selectCvDoc = (s: Pick<State, 'documents' | 'activeId'>): CVDoc =>
  (s.documents.find((d) => d.id === s.activeId && d.kind === 'cv') ?? s.documents.find((d) => d.kind === 'cv')) as CVDoc

export const useCvDoc = () => useStore(selectCvDoc)

/** Lettre du document actif ; si c'est un CV, la première lettre (absente : undefined). */
export const selectLetterDoc = (s: Pick<State, 'documents' | 'activeId'>): LetterDoc | undefined =>
  (s.documents.find((d) => d.id === s.activeId && d.kind === 'letter') ?? s.documents.find((d) => d.kind === 'letter')) as LetterDoc | undefined

export const useLetterDoc = () => useStore(selectLetterDoc)

/** Résultat de la dernière écriture dans localStorage : `error` = stockage plein ou refusé (la saisie reste en mémoire). */
export const useSaveStatus = create<{ error: 'quota' | 'unavailable' | null; savedAt: number | null }>(() => ({ error: null, savedAt: null }))

const safe = <T,>(fn: () => T): T | null => {
  try { return fn() } catch { return null }
}
let pending: { name: string; value: string } | null = null
let booted = false // hydratation initiale faite (voir `merge`)
let rewrite = false // la relecture a gardé une version locale plus récente : à réécrire
let lastWrite = 0 // heure de la dernière écriture réussie : un document modifié après n'est pas encore dans le stockage
let timer: ReturnType<typeof setTimeout>

/** Écrit tout de suite l'état en attente (appelé après 500 ms de calme, à la fermeture de la page et au démarrage). */
export function flushSave() {
  clearTimeout(timer)
  if (!pending) return
  const { name, value } = pending
  try {
    localStorage.setItem(name, value)
    pending = null
    lastWrite = Date.now()
    localStorage.removeItem('cvlove:v1') // migré : le doublon (photo comprise) ne doit pas remplir le quota
    useSaveStatus.setState({ error: null, savedAt: lastWrite }) // savedAt : sert au témoin « Enregistré » (SavedMark), rien d'autre
  } catch (e) {
    useSaveStatus.setState({ error: e instanceof DOMException && e.name === 'QuotaExceededError' ? 'quota' : 'unavailable' })
  }
}
/** Efface les données locales, sans écriture en attente qui les ressusciterait à la fermeture de la page. */
export function wipeStorage() {
  clearTimeout(timer)
  pending = null
  for (const k of ['cvlove:v2', 'cvlove:v1', 'cvlove:corrupt']) safe(() => localStorage.removeItem(k)) // corrupt : copie brute (données personnelles) gardée après un JSON illisible
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
          const keep = d.draft && !p.design && isBlankDraft({ ...d, ...p } as CVDoc) // toujours vierge : reste un brouillon
          return { documents: patchDoc(s.documents, d.id, { ...p, ...(p.data ? { name: followName(d, p.data, s.uiLang) } : {}), ...(d.draft && !keep ? { draft: undefined } : {}), updatedAt: Date.now() }) }
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
        setUiLang: (uiLang) => set((s) => ({ uiLang, documents: alignBlank(s.documents, uiLang) })),
        setEditorMode: (editorMode) => set((s) => ({ documents: patchDoc(s.documents, selectCvDoc(s).id, { editorMode }) })),
        clearAll: () => patchActive((d) => ({ data: emptyCV(d.data.lang) })),
        loadSample: (profile) => patchActive((d) => ({ data: sampleCV(d.data.lang, profile) })),
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
          // Brouillon lui aussi : listé et enregistré à la première saisie ou au premier choix de design, jamais vide dans la liste.
          const doc: CVDoc = { ...newCVDoc(freeName(get().documents.filter((d) => !isBlankDraft(d)), untitledName(get().uiLang)), blankCV(get().uiLang), selectCvDoc(get()).design), draft: true }
          set((s) => ({ documents: [...s.documents.filter((d) => !isBlankDraft(d)), doc], activeId: doc.id }))
          return doc.id
        },
        duplicate: (id) =>
          set((s) => {
            const src = s.documents.find((d) => d.id === id)
            if (!src) return s
            const copy = duplicateDoc(src, freeName(s.documents, src.name))
            return { documents: dropBlankDrafts([...s.documents, copy]), activeId: copy.id }
          }),
        rename: (id, name) => set((s) => ({ documents: patchDoc(s.documents, id, { name: name.trim() || 'CV' }) })),
        remove: (id) =>
          set((s) => {
            let documents = s.documents.filter((d) => d.id !== id)
            if (!documents.some((d) => d.kind === 'cv')) documents = [...documents, draftCVDoc(s.uiLang)] // jamais sans CV : un brouillon vierge
            const activeId = documents.some((d) => d.id === s.activeId) ? s.activeId : documents[0].id
            return { documents, activeId }
          }),
        replaceDoc: (id, src) => {
          if (!get().documents.some((d) => d.id === id && d.kind === src.kind)) return false
          set((s) => ({ documents: s.documents.map((d) => (d.id === id ? ({ ...src, id, updatedAt: Date.now(), draft: undefined } as Doc) : d)) }))
          return true
        },
        importDocs: (json) => {
          const docs = parseImport(json)
          set((s) => ({ documents: dropBlankDrafts([...s.documents, ...docs]) }))
          return docs.length
        },
      }
    },
    {
      name: 'cvlove:v2',
      version: 2,
      // Relecture après un autre onglet (voir `sync`) : cet onglet garde son document ouvert, sa langue d'interface et son brouillon vierge en cours.
      merge: (persisted, current) => {
        const p = persisted as Pick<State, 'documents' | 'activeId' | 'uiLang'>
        if (!booted) return { ...current, ...p }
        // Même document modifié des deux côtés : la version la plus récente gagne (la frappe d'ici pas encore écrite n'est pas perdue).
        const mine = new Map(current.documents.map((d) => [d.id, d]))
        const read = p.documents.map((d) => { const m = mine.get(d.id); if (m && m.updatedAt > d.updatedAt) { rewrite = true; return m } return d })
        // Absent du stockage : supprimé ailleurs s'il y avait été écrit, sinon créé ici et pas encore écrit (on le garde).
        // shortcut: deux onglets qui écrivent à moins de 500 ms d'écart peuvent perdre un document neuf ; marquer les suppressions (ids supprimés persistés) si ça devient réel.
        const ids = new Set(p.documents.map((d) => d.id))
        const unwritten = current.documents.filter((d) => !ids.has(d.id) && !isBlankDraft(d) && d.updatedAt > lastWrite)
        if (unwritten.length) rewrite = true
        const all = dropBlankDrafts([...read, ...unwritten])
        const blank = current.documents.find((d) => d.id === current.activeId && isBlankDraft(d))
        const documents = blank ? [...all.filter((d) => !isBlankDraft(d)), blank] : all
        return { ...current, documents, activeId: documents.some((d) => d.id === current.activeId) ? current.activeId : p.activeId }
      },
      partialize: (s) => ({ documents: s.documents.filter((d) => !isBlankDraft(d)), activeId: s.activeId, uiLang: s.uiLang }), // un brouillon s'enregistre dès qu'il a du contenu
      storage: {
        // Lecture : toujours un état valide (voir model/sanitize.ts). JSON illisible : copie brute dans `cvlove:corrupt`, on repart d'un CV vierge.
        getItem: (name) => {
          const raw = safe(() => localStorage.getItem(name))
          try {
            // Premier lancement en v2 : le stockage v1 (`cvlove:v1`) est converti à la lecture, puis supprimé après la première écriture v2 réussie.
            const v1 = raw ? null : safe(() => localStorage.getItem('cvlove:v1'))
            if (!raw && !v1) return null
            const state = raw ? JSON.parse(raw).state : migrateV1(JSON.parse(v1!).state)
            return { state: sanitizeState(state, () => draftCVDoc(LANGS.includes(state?.uiLang) ? state.uiLang : detectLang())), version: 2 }
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
// Le CV vierge créé au chargement du module a la langue du navigateur : il prend celle de l'interface mémorisée.
useStore.setState((s) => ({ documents: alignBlank(s.documents, s.uiLang) }))
flushSave()
booted = true

/**
 * Autre onglet : on relit ses écritures (sinon cet onglet réécrirait son état ancien par-dessus au prochain changement), en jetant
 * l'écriture en attente d'ici, devenue périmée. Onglet masqué : au retour seulement (pas d'aperçu PDF refait pour rien). Effacement : on repart à vide.
 */
let stale = false
const sync = () => {
  stale = false
  clearTimeout(timer)
  pending = null
  rewrite = false
  // Réécrit seulement si l'on a gardé du neuf : l'autre onglet, lui, n'aura rien de plus récent, donc pas d'aller-retour sans fin.
  void Promise.resolve(useStore.persist.rehydrate()).then(() => rewrite && useStore.setState({}))
}
addEventListener('storage', (e) => {
  if (e.key !== 'cvlove:v2') return
  if (e.newValue === null) {
    clearTimeout(timer)
    pending = null
    const d = draftCVDoc(useStore.getState().uiLang)
    useStore.setState({ documents: [d], activeId: d.id })
  } else if (document.hidden) stale = true
  else sync()
})
addEventListener('visibilitychange', () => document.visibilityState === 'visible' && stale && sync())

/** Dernière suppression annulable (au plus une, jamais écrite dans le stockage). `rid` = data-rid de l'élément à refocaliser, `n` change à chaque suppression. */
export const useUndo = create<{ snap: (Snap & { label: string; rid: string; n: number }) | null }>(() => ({ snap: null }))
let deletions = 0

/** Supprime dans le CV actif en gardant son état d'avant : le bandeau « {label} supprimé(e) · Annuler » en dépend. */
export function deleteWith(label: string, rid: string, fn: (cv: CV) => CV) {
  const s = useStore.getState()
  const d = selectCvDoc(s)
  useUndo.setState({ snap: { docId: d.id, data: d.data, label, rid, n: ++deletions } })
  s.update(fn)
}

/** Annule la dernière suppression ; renvoie le data-rid à refocaliser, ou null si rien n'a été rétabli (document changé ou disparu). */
export function undoDelete(): string | null {
  const snap = useUndo.getState().snap
  useUndo.setState({ snap: null })
  if (!snap) return null
  const documents = restoreSnap(useStore.getState().documents, useStore.getState().activeId, snap)
  if (!documents) return null
  useStore.setState({ documents })
  return snap.rid
}
