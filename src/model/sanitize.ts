import { DEFAULT_DESIGN, emptyCV, uid } from './cv'
import { blankLetter } from './letter'
import {
  CEFR, FIELD_KINDS, FONT_PAIRS, LANGS, MARGINS, PAGE_SIZES, PHOTO_SHAPES, SECTION_KINDS, SKILL_DISPLAYS, cefrFromLevel,
  type CV, type Design, type Doc, type EditorMode, type Field, type Item, type Lang, type Letter, type Section,
} from './types'

/** Limites de taille : l'import JSON, l'image de la photo (avant réduction) et la photo gardée (data URL). */
export const MAX_IMPORT_BYTES = 5_000_000
export const MAX_PHOTO_FILE_BYTES = 15_000_000
const MAX_PHOTO_CHARS = 1_500_000
const MAX_TEXT = 20_000
const MAX = { docs: 100, sections: 50, items: 200, fields: 30 }

type Obj = Record<string, unknown>
const isObj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x)
const obj = (x: unknown): Obj => (isObj(x) ? x : {})
const arr = (x: unknown, max: number): unknown[] => (Array.isArray(x) ? x.slice(0, max) : [])
const str = (x: unknown, def = ''): string => (typeof x === 'string' ? x.slice(0, MAX_TEXT) : def)
const bool = (x: unknown, def: boolean) => (typeof x === 'boolean' ? x : def)
const oneOf = <T extends string>(list: readonly T[], x: unknown, def: T): T => (list as readonly unknown[]).includes(x) ? (x as T) : def
const num = (x: unknown, min: number, max: number, def: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : def)

/** Côté maximal d'une photo : au-delà, une image très compressible (quelques Ko, 20 000 px de côté) bloquerait le rendu du PDF. */
export const MAX_PHOTO_SIDE = 4000

/**
 * Largeur et hauteur d'un PNG ou d'un JPEG, null si le fichier n'est pas bien formé. Strict exprès (on refuse ce qu'on ne sait pas lire) :
 * un PNG forgé (bloc de longueur négative, faux bloc avant l'IHDR) bloquait le décodeur de react-pdf ou cachait sa vraie taille.
 */
export function imageSize(b64: string, mime: 'png' | 'jpeg'): [number, number] | null {
  let s: string
  try { s = atob(b64) } catch { return null }
  const u8 = (i: number) => s.charCodeAt(i)
  const be16 = (i: number) => (u8(i) << 8) | u8(i + 1)
  const be32 = (i: number) => be16(i) * 65536 + be16(i + 2)
  if (mime === 'png') {
    if (!s.startsWith('\x89PNG\r\n\x1a\n') || s.slice(12, 16) !== 'IHDR' || be32(8) !== 13) return null
    // Chaque bloc : longueur, type, données, CRC ; tous doivent tenir dans le fichier, jusqu'au bloc final IEND.
    for (let i = 8; i + 12 <= s.length; ) {
      const len = be32(i)
      if (len > s.length - i - 12) return null
      if (s.slice(i + 4, i + 8) === 'IEND') return [be32(16), be32(20)]
      i += 12 + len
    }
    return null
  }
  if (u8(0) !== 0xff || u8(1) !== 0xd8) return null
  // On saute de segment en segment (longueur en tête de chaque segment) jusqu'au SOF, qui porte les dimensions ; 0xFF répétés = bourrage.
  for (let i = 2; i + 9 < s.length; ) {
    if (u8(i) !== 0xff) return null
    const m = u8(i + 1)
    if (m === 0xff) { i++; continue }
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [be16(i + 7), be16(i + 5)]
    const len = be16(i + 2)
    if (len < 2) return null
    i += 2 + len
  }
  return null
}

/** Seules les images embarquées passent (une URL distante ferait faire une requête réseau au rendu), en PNG ou JPEG lisible et de taille raisonnable. */
export function cleanPhoto(p: unknown): string {
  const m = typeof p === 'string' && p.length <= MAX_PHOTO_CHARS ? /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]*={0,2})$/.exec(p) : null
  const size = m && imageSize(m[2], m[1] as 'png' | 'jpeg')
  return size && size[0] > 0 && size[1] > 0 && Math.max(...size) <= MAX_PHOTO_SIDE ? (p as string) : ''
}

/** Texte total d'un document importé (photo exclue) : au-delà, l'aperçu PDF bloquerait l'onglet à chaque ouverture. */
export const MAX_DOC_TEXT = 300_000

export function cleanDesign(d: unknown): Design {
  const o = obj(d)
  const c = obj(o.custom)
  const custom = {
    ...(typeof c.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.accent) ? { accent: c.accent } : {}),
    ...((FONT_PAIRS as readonly unknown[]).includes(c.fontPair) ? { fontPair: c.fontPair as Design['fontPair'] } : {}),
  }
  return {
    ...(Object.keys(custom).length ? { custom } : {}),
    ...(o.fitPage === true ? { fitPage: true } : {}),
    templateId: str(o.templateId).slice(0, 64) || DEFAULT_DESIGN.templateId,
    accent: typeof o.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(o.accent) ? o.accent : DEFAULT_DESIGN.accent,
    fontPair: oneOf(FONT_PAIRS, o.fontPair, DEFAULT_DESIGN.fontPair),
    fontScale: num(o.fontScale, 0.9, 1.15, DEFAULT_DESIGN.fontScale),
    lineHeight: num(o.lineHeight, 1.2, 1.6, DEFAULT_DESIGN.lineHeight),
    margins: oneOf(MARGINS, o.margins, DEFAULT_DESIGN.margins),
    pageSize: oneOf(PAGE_SIZES, o.pageSize, DEFAULT_DESIGN.pageSize),
    photoShape: oneOf(PHOTO_SHAPES, o.photoShape, DEFAULT_DESIGN.photoShape),
    skillDisplay: oneOf(SKILL_DISPLAYS, o.skillDisplay, DEFAULT_DESIGN.skillDisplay),
  }
}

const cleanField = (f: unknown): Field => {
  const o = obj(f)
  return { id: str(o.id) || uid(), kind: oneOf(FIELD_KINDS, o.kind, 'custom'), ...(typeof o.label === 'string' ? { label: str(o.label) } : {}), value: str(o.value), visible: bool(o.visible, true) }
}

const cleanItem = (i: unknown): Item => {
  const o = obj(i)
  const level = typeof o.level === 'number' ? Math.round(num(o.level, 0, 5, 0)) : 0
  return {
    id: str(o.id) || uid(), title: str(o.title), subtitle: str(o.subtitle), place: str(o.place), start: str(o.start), end: str(o.end),
    current: bool(o.current, false), text: str(o.text), ...(level ? { level } : {}),
  }
}

/** Langues : `cefr` valide gardé, sinon l'ancien `level` 1 à 5 est migré ; `level` n'existe plus pour les langues. */
const cleanLanguage = (i: Item, raw: unknown): Item => {
  const { level, ...rest } = i
  const c = obj(raw).cefr
  const cefr = CEFR.find((x) => x === c) ?? (level ? cefrFromLevel(level) : undefined)
  return cefr ? { ...rest, cefr } : rest
}

const cleanSection = (s: Obj): Section => ({
  id: str(s.id) || uid(), kind: s.kind as Section['kind'], title: str(s.title), visible: bool(s.visible, true),
  ...(s.collapsed === true ? { collapsed: true } : {}),
  items: arr(s.items, MAX.items).filter(isObj).map((i) => (s.kind === 'languages' ? cleanLanguage(cleanItem(i), i) : cleanItem(i))),
})

/** Un CV toujours valide : langue, champs, sections et items reconstruits un à un (les clés inconnues, dont `__proto__`, sont écartées). */
export function sanitizeCV(d: unknown): CV {
  const o = obj(d)
  const p = obj(o.personal)
  const lang = oneOf<Lang>(LANGS, o.lang, 'fr')
  const fields = arr(p.fields, MAX.fields).filter(isObj).map(cleanField)
  return {
    lang,
    personal: {
      firstName: str(p.firstName), lastName: str(p.lastName), title: str(p.title), photo: cleanPhoto(p.photo),
      fields: Array.isArray(p.fields) ? fields : emptyCV(lang).personal.fields,
    },
    sections: arr(o.sections, MAX.sections).filter((s): s is Obj => isObj(s) && SECTION_KINDS.includes(s.kind as never)).map(cleanSection),
  }
}

export function sanitizeLetter(d: unknown): Letter {
  const o = obj(d)
  const b = blankLetter(oneOf<Lang>(LANGS, o.lang, 'fr'))
  const pick = <T extends Record<string, string>>(base: T, src: unknown): T => {
    const s = obj(src)
    return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, str(s[k], v)])) as T
  }
  const { lang, sender, recipient, ...rest } = b
  return { lang, sender: pick(sender, o.sender), recipient: pick(recipient, o.recipient), ...pick(rest, o) }
}

/** Un document valide, ou null s'il n'est ni un CV ni une lettre. */
export function sanitizeDoc(d: unknown): Doc | null {
  const o = obj(d)
  const base = {
    id: str(o.id) || uid(), name: str(o.name).slice(0, 100) || 'CV', design: cleanDesign(o.design),
    updatedAt: typeof o.updatedAt === 'number' && Number.isFinite(o.updatedAt) ? o.updatedAt : Date.now(),
    ...(o.editorMode === 'guided' || o.editorMode === 'full' ? { editorMode: o.editorMode as EditorMode } : {}),
  }
  if (o.kind === 'cv') return { ...base, kind: 'cv', data: sanitizeCV(o.data) }
  if (o.kind === 'letter') return { ...base, kind: 'letter', data: sanitizeLetter(o.data) }
  return null
}

/** Documents valides (au plus MAX.docs), ids rendus uniques. */
export const sanitizeDocs = (docs: unknown): Doc[] => {
  const seen = new Set<string>()
  return arr(docs, MAX.docs).flatMap((x) => {
    const d = sanitizeDoc(x)
    if (!d) return []
    if (seen.has(d.id)) d.id = uid()
    seen.add(d.id)
    return [d]
  })
}

/** État persistant (localStorage) : toujours utilisable, avec au moins un CV et un document actif existant. */
export function sanitizeState(raw: unknown, blank: () => Doc): { documents: Doc[]; activeId: string; uiLang?: Lang } {
  const o = obj(raw)
  const documents = sanitizeDocs(o.documents)
  if (!documents.some((d) => d.kind === 'cv')) documents.push(blank())
  return {
    documents,
    activeId: documents.some((d) => d.id === o.activeId) ? (o.activeId as string) : documents[0].id,
    ...(LANGS.includes(o.uiLang as Lang) ? { uiLang: o.uiLang as Lang } : {}),
  }
}
