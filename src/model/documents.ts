import { DEFAULT_DESIGN, emptyCV, isCVData, newSection, uid } from './cv'
import { normalizeLetter } from './letter'
import type { CV, CVDoc, Design, Doc, Lang } from './types'

/** CV vierge avec les sections de base (une ligne vide chacune), prêt à remplir. */
export function blankCV(lang: Lang): CV {
  return { ...emptyCV(lang), sections: (['profile', 'experience', 'education', 'skills', 'languages'] as const).map(newSection) }
}

export const newCVDoc = (name: string, data: CV, design: Design = DEFAULT_DESIGN): CVDoc => ({
  id: uid(), kind: 'cv', name, updatedAt: Date.now(), design, data, editorMode: 'guided',
})

/** Copie profonde avec de nouveaux identifiants de document (les ids internes peuvent rester : ils ne sont uniques que dans un document). */
export const duplicateDoc = (d: Doc, name: string): Doc => ({ ...structuredClone(d), id: uid(), name, updatedAt: Date.now() })

export const patchDoc = (docs: Doc[], id: string, patch: Partial<Doc>): Doc[] =>
  docs.map((d) => (d.id === id ? ({ ...d, ...patch } as Doc) : d))

/** Nom libre « CV 2 », « CV 3 »… qui n'existe pas encore. */
export function freeName(docs: Doc[], base: string): string {
  const names = new Set(docs.map((d) => d.name))
  for (let i = docs.length + 1; ; i++) if (!names.has(`${base} ${i}`)) return `${base} ${i}`
}

/** Fichier d'export : un ou plusieurs documents. */
export const exportDocs = (docs: Doc[]) => JSON.stringify({ app: 'cvlove', version: 2, documents: docs }, null, 2)

/** Import : fichier v2 (documents), ou ancien export v1 (un CV nu). Lève `Error('invalid')` sinon. */
export function parseImport(json: string): Doc[] {
  const d = JSON.parse(json)
  if (d && Array.isArray(d.documents)) {
    const docs = d.documents.filter((x: any) => (x?.kind === 'cv' && isCVData(x.data)) || (x?.kind === 'letter' && x.data))
    if (!docs.length) throw new Error('invalid')
    return docs.map((x: Doc) => ({ ...x, ...(x.kind === 'letter' ? { data: normalizeLetter(x.data) } : {}), id: uid(), design: { ...DEFAULT_DESIGN, ...x.design }, updatedAt: Date.now() }))
  }
  if (isCVData(d)) {
    const { templateId, accent, ...data } = d as CV & { templateId?: string; accent?: string }
    return [{ ...newCVDoc('CV', { ...emptyCV(), ...data }, designFromV1({ templateId, accent })), editorMode: 'full' }]
  }
  throw new Error('invalid')
}

/** Design d'un CV v1 (templateId + accent dans le CV) : première variante de la mise en page, même couleur. */
/** Stockage v1 (`cvlove:v1`, état zustand `{ cv, uiLang }`) -> v2 : le CV devient le premier document, rien n'est perdu. */
export function migrateV1(state: { cv?: unknown; uiLang?: Lang }): { documents: Doc[]; activeId: string; uiLang?: Lang } {
  const [doc] = isCVData(state?.cv) ? parseImport(JSON.stringify(state.cv)) : []
  const d = doc ?? newCVDoc('CV', blankCV(state?.uiLang ?? 'fr'))
  return { documents: [{ ...d, name: 'CV', editorMode: 'full' }], activeId: d.id, uiLang: state?.uiLang }
}

export function designFromV1(cv: { templateId?: string; accent?: string }): Design {
  const layout = cv.templateId ?? 'classique'
  return {
    ...DEFAULT_DESIGN,
    templateId: `${layout}-1`,
    accent: cv.accent ?? DEFAULT_DESIGN.accent,
    fontPair: layout === 'classique' ? 'lora' : 'inter',
    photoShape: layout === 'creatif' ? 'rounded' : 'circle',
  }
}
