import { extra } from '../i18n/extra'
import { DEFAULT_DESIGN, emptyCV, fullName, isCVData, newSection, uid } from './cv'
import { MAX_IMPORT_BYTES, cleanDesign, sanitizeCV, sanitizeDocs } from './sanitize'
import type { CV, CVDoc, Design, Doc, Lang } from './types'

/** CV vierge avec les sections de base (une ligne vide chacune), prêt à remplir. */
export function blankCV(lang: Lang): CV {
  return { ...emptyCV(lang), sections: (['profile', 'experience', 'education', 'skills', 'languages'] as const).map(newSection) }
}

/** Nom d'un CV pas encore nommé (« CV sans titre » dans la langue de l'interface). */
export const untitledName = (lang: Lang) => extra[lang].untitled

const UNTITLED = new RegExp(`^(${Object.values(extra).map((e) => e.untitled.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})( \\d+)?$`)

/** Nom du document après un changement de données : un nom automatique (« CV sans titre », ou le nom de la personne avant modification) suit le nom de la personne. */
export function followName(d: CVDoc, next: CV, lang: Lang): string {
  const was = fullName(d.data)
  if (!(UNTITLED.test(d.name) || (was && d.name === was))) return d.name
  return fullName(next) || untitledName(lang)
}

export const newCVDoc = (name: string, data: CV, design: Design = DEFAULT_DESIGN): CVDoc => ({
  id: uid(), kind: 'cv', name, updatedAt: Date.now(), design, data, editorMode: 'guided',
})

/** CV vierge créé d'office : un brouillon, que l'on peut enregistrer ou supprimer. */
export const draftCVDoc = (lang: Lang): CVDoc => ({ ...newCVDoc(untitledName(lang), blankCV(lang)), draft: true })

/** Copie profonde avec de nouveaux identifiants de document (les ids internes peuvent rester : ils ne sont uniques que dans un document). */
export const duplicateDoc = (d: Doc, name: string): Doc => ({ ...structuredClone(d), id: uid(), name, updatedAt: Date.now(), draft: undefined })

export const patchDoc = (docs: Doc[], id: string, patch: Partial<Doc>): Doc[] =>
  docs.map((d) => (d.id === id ? ({ ...d, ...patch } as Doc) : d))

/** Nom libre : « Lettre » tant qu'il est libre, puis « Lettre 2 », « Lettre 3 »… (numérotation par nom, donc par type). */
export function freeName(docs: Doc[], base: string): string {
  const names = new Set(docs.map((d) => d.name))
  if (!names.has(base)) return base
  for (let i = 2; ; i++) if (!names.has(`${base} ${i}`)) return `${base} ${i}`
}

/** Fichier d'export : un ou plusieurs documents. */
export const exportDocs = (docs: Doc[]) => JSON.stringify({ app: 'cvlove', version: 2, documents: docs }, null, 2)

/** Import : fichier v2 (documents), ou ancien export v1 (un CV nu). Lève `Error('invalid')` sinon. */
export function parseImport(json: string): Doc[] {
  if (json.length > MAX_IMPORT_BYTES) throw new Error('invalid')
  const d = JSON.parse(json)
  if (d && Array.isArray(d.documents)) {
    const docs = sanitizeDocs(d.documents.filter((x: any) => (x?.kind === 'cv' && isCVData(x.data)) || (x?.kind === 'letter' && x.data)))
    if (!docs.length) throw new Error('invalid')
    return docs.map((x) => ({ ...x, id: uid(), updatedAt: Date.now() }))
  }
  if (isCVData(d)) {
    const { templateId, accent, ...data } = d as CV & { templateId?: string; accent?: string }
    return [{ ...newCVDoc('CV', sanitizeCV(data), cleanDesign(designFromV1({ templateId, accent }))), editorMode: 'full' }]
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
