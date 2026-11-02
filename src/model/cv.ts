import type { CV, Design, Field, FieldKind, Item, Lang, Section, SectionKind } from './types'

let n = 0
export const uid = () => `${Date.now().toString(36)}${(n++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const emptyItem = (): Item => ({
  id: uid(), title: '', subtitle: '', place: '', start: '', end: '', current: false, text: '',
})

export const newSection = (kind: SectionKind): Section => ({
  id: uid(), kind, title: '', visible: true, items: [emptyItem()],
})

export const newField = (kind: FieldKind, value = '', label = ''): Field => ({
  id: uid(), kind, value, label, visible: true,
})

export const DEFAULT_FIELD_KINDS: FieldKind[] = ['birthDate', 'location', 'email', 'phone', 'website']

export const DEFAULT_DESIGN: Design = {
  templateId: 'classique-1', accent: '#c2410c', fontPair: 'lora', fontScale: 1, lineHeight: 1.4,
  margins: 'normal', pageSize: 'A4', photoShape: 'circle', skillDisplay: 'text',
}

export function emptyCV(lang: Lang = 'fr'): CV {
  return {
    lang,
    personal: {
      firstName: '', lastName: '', title: '', photo: '',
      fields: DEFAULT_FIELD_KINDS.map((k) => newField(k)),
    },
    sections: [],
  }
}

/** Déplace l'élément i de `dir` (-1 haut, +1 bas) ; sans effet aux bornes. */
export function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir
  if (i < 0 || j < 0 || j >= arr.length) return arr
  const out = arr.slice()
  ;[out[i], out[j]] = [out[j], out[i]]
  return out
}

/** Changer de langue ne touche QUE `lang` : contenu et titres personnalisés restent intacts. */
export const setLang = (cv: CV, lang: Lang): CV => ({ ...cv, lang })

export const addSection = (cv: CV, kind: SectionKind): CV => ({ ...cv, sections: [...cv.sections, newSection(kind)] })
export const removeSection = (cv: CV, id: string): CV => ({ ...cv, sections: cv.sections.filter((s) => s.id !== id) })
export const moveSection = (cv: CV, id: string, dir: -1 | 1): CV => ({
  ...cv, sections: move(cv.sections, cv.sections.findIndex((s) => s.id === id), dir),
})
/** Place la section `id` au rang `index` (0 = première) en une seule mise à jour ; rang borné, `cv` rendu tel quel si rien ne bouge. */
export const moveSectionTo = (cv: CV, id: string, index: number): CV => {
  const from = cv.sections.findIndex((s) => s.id === id)
  const to = Math.max(0, Math.min(cv.sections.length - 1, Math.trunc(index)))
  if (from < 0 || from === to) return cv
  const sections = cv.sections.slice()
  sections.splice(to, 0, sections.splice(from, 1)[0])
  return { ...cv, sections }
}
/** Replie (ou déplie) les sections `ids` (toutes par défaut). `collapsed` ne sert qu'à l'éditeur : ni le PDF ni le contenu ne changent. */
export const setCollapsed = (cv: CV, collapsed: boolean, ids?: string[]): CV => ({
  ...cv, sections: cv.sections.map((s) => (!ids || ids.includes(s.id) ? { ...s, collapsed: collapsed || undefined } : s)),
})
/** Vrai si `a` et `b` ne diffèrent que par `collapsed` : le PDF est alors identique, l'aperçu n'a pas à être refait (comparaison par référence, sans sérialiser). */
export const sameRendered = (a: CV, b: CV): boolean => {
  if (a === b) return true
  const ks = Object.keys(a) as (keyof CV)[]
  if (ks.length !== Object.keys(b).length || ks.some((k) => k !== 'sections' && a[k] !== b[k])) return false
  return a.sections.length === b.sections.length && a.sections.every((s, i) => {
    const t = b.sections[i]
    const { collapsed: _a, ...ra } = s, { collapsed: _b, ...rb } = t
    const kk = Object.keys(ra) as (keyof typeof ra)[]
    return kk.length === Object.keys(rb).length && kk.every((k) => ra[k] === rb[k as keyof typeof rb])
  })
}
export const patchSection = (cv: CV, id: string, patch: Partial<Section>): CV => ({
  ...cv, sections: cv.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
})

export const addItem = (cv: CV, sectionId: string): CV => patchItems(cv, sectionId, (it) => [...it, emptyItem()])
export const removeItem = (cv: CV, sectionId: string, id: string): CV =>
  patchItems(cv, sectionId, (it) => it.filter((x) => x.id !== id))
export const moveItem = (cv: CV, sectionId: string, id: string, dir: -1 | 1): CV =>
  patchItems(cv, sectionId, (it) => move(it, it.findIndex((x) => x.id === id), dir))
export const patchItem = (cv: CV, sectionId: string, id: string, patch: Partial<Item>): CV =>
  patchItems(cv, sectionId, (it) => it.map((x) => (x.id === id ? { ...x, ...patch } : x)))

const patchItems = (cv: CV, sectionId: string, fn: (it: Item[]) => Item[]): CV => ({
  ...cv, sections: cv.sections.map((s) => (s.id === sectionId ? { ...s, items: fn(s.items) } : s)),
})

export const patchField = (cv: CV, id: string, patch: Partial<Field>): CV => ({
  ...cv, personal: { ...cv.personal, fields: cv.personal.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) },
})
export const removeField = (cv: CV, id: string): CV => ({
  ...cv, personal: { ...cv.personal, fields: cv.personal.fields.filter((f) => f.id !== id) },
})
export const addCustomField = (cv: CV): CV => ({
  ...cv, personal: { ...cv.personal, fields: [...cv.personal.fields, newField('custom')] },
})
export const addField = (cv: CV, kind: FieldKind): CV => ({
  ...cv, personal: { ...cv.personal, fields: [...cv.personal.fields, newField(kind)] },
})

const itemHasContent = (i: Item) => !!(i.title.trim() || i.subtitle.trim() || i.text.trim() || i.place.trim())

/** Sections à dessiner : visibles et non vides (items vides écartés). Les templates partent de là. */
export function visibleSections(cv: CV): Section[] {
  return cv.sections
    .filter((s) => s.visible)
    .map((s) => ({ ...s, items: s.items.filter(itemHasContent) }))
    .filter((s) => s.items.length > 0)
}

export const visibleFields = (cv: CV): Field[] => cv.personal.fields.filter((f) => f.visible && f.value.trim())

export const fullName = (cv: CV) => `${cv.personal.firstName} ${cv.personal.lastName}`.trim()

/** Pour un nom de fichier : retire les accents latins seulement (U+0300 à U+036F), garde les lettres et marques des autres écritures (arabe…). */
export const slug = (s: string) =>
  s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC').replace(/[^\p{L}\p{N}\p{M}]+/gu, '-').replace(/^-|-$/g, '')

export const pdfFileName = (cv: CV) => {
  const parts = [slug(cv.personal.firstName), slug(cv.personal.lastName)].filter(Boolean)
  return `CV-${parts.join('-') || 'CVLove'}.pdf`
}

/** Garde-fou minimal sur la forme d'un CV (import JSON). */
export const isCVData = (d: any): d is CV =>
  !!d && typeof d === 'object' && !!d.personal && Array.isArray(d.sections) && Array.isArray(d.personal.fields)

/**
 * Applique un changement de design. Un réglage manuel de couleur ou de police est mémorisé (`custom`) ;
 * choisir un modèle (patch avec `templateId`) applique son preset sans écraser ces choix.
 */
export function applyDesignPatch(d: Design, patch: Partial<Design>): Design {
  if (patch.templateId !== undefined) return { ...d, ...patch, ...d.custom }
  const custom = { ...d.custom, ...(patch.accent ? { accent: patch.accent } : {}), ...(patch.fontPair ? { fontPair: patch.fontPair } : {}) }
  return { ...d, ...patch, ...(Object.keys(custom).length ? { custom } : {}) }
}
