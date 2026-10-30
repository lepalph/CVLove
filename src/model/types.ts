export const LANGS = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar'] as const
export type Lang = (typeof LANGS)[number]

export const SECTION_KINDS = [
  'profile', 'experience', 'education', 'skills', 'languages', 'projects', 'interests', 'custom',
] as const
export type SectionKind = (typeof SECTION_KINDS)[number]

export const FIELD_KINDS = ['birthDate', 'location', 'email', 'phone', 'website', 'custom'] as const
export type FieldKind = (typeof FIELD_KINDS)[number]

/** Champ de contact. `label` ne sert qu'aux champs libres (kind 'custom'). */
export interface Field {
  id: string
  kind: FieldKind
  label?: string
  value: string // birthDate : AAAA-MM-JJ
  visible: boolean
}

/**
 * Item générique, interprété selon le type de section :
 * - profile : text
 * - experience / education / projects / custom : title, subtitle, place, dates, text
 * - skills : title = groupe, text = liste ; languages : title = langue, text = niveau libre (« C1 »)
 * - interests : title
 * `level` (1 à 5, absent ou 0 = aucun) : niveau chiffré des compétences et des langues, affiché selon `design.skillDisplay`.
 * Dates au format AAAA-MM. Tout est du contenu saisi : jamais traduit.
 */
export interface Item {
  id: string
  title: string
  subtitle: string
  place: string
  start: string
  end: string
  current: boolean
  text: string
  level?: number
}

export interface Section {
  id: string
  kind: SectionKind
  /** Titre personnalisé ; vide = libellé de la langue du CV. */
  title: string
  visible: boolean
  items: Item[]
}

export interface Personal {
  firstName: string
  lastName: string
  title: string
  photo: string // data URL ou ''
  fields: Field[]
}

/** Contenu d'un CV : la mise en forme est dans `Design` (par document). */
export interface CV {
  lang: Lang
  personal: Personal
  sections: Section[]
}

export const FONT_PAIRS = ['inter', 'lora', 'source', 'playfair', 'montserrat', 'livre'] as const
export type FontPair = (typeof FONT_PAIRS)[number]
export const MARGINS = ['compact', 'normal', 'large'] as const
export type Margins = (typeof MARGINS)[number]
export const PAGE_SIZES = ['A4', 'LETTER'] as const
export type PageSize = (typeof PAGE_SIZES)[number]
export const PHOTO_SHAPES = ['circle', 'rounded', 'square'] as const
export type PhotoShape = (typeof PHOTO_SHAPES)[number]
export const SKILL_DISPLAYS = ['text', 'bars', 'dots'] as const
export type SkillDisplay = (typeof SKILL_DISPLAYS)[number]

/** Mise en forme d'un document. `templateId` = `<mise en page>-<n° de style>` (voir templates/types.ts). */
export interface Design {
  templateId: string
  accent: string // hex #rrggbb libre
  fontPair: FontPair
  fontScale: number // 0.9 à 1.15
  lineHeight: number // 1.2 à 1.6
  margins: Margins
  pageSize: PageSize
  photoShape: PhotoShape
  skillDisplay: SkillDisplay
  /** Choix faits à la main dans Design : ils survivent au changement de modèle (le preset du style ne s'applique que sans eux). */
  custom?: { accent?: string; fontPair?: FontPair }
}

/** Lettre de motivation : données minimales (l'UI et les mises en page viennent en phase 4). */
export interface Letter {
  lang: Lang
  sender: { name: string; title: string; email: string; phone: string; address: string }
  recipient: { name: string; company: string; address: string }
  place: string
  date: string // AAAA-MM-JJ
  subject: string
  salutation: string
  body: string
  closing: string
  signature: string
}

/** Mode d'édition d'un CV : absent (documents migrés ou importés) = complet ; un nouveau document démarre en guidé. */
export type EditorMode = 'guided' | 'full'

interface DocBase {
  id: string
  name: string
  updatedAt: number // ms depuis epoch
  design: Design
  editorMode?: EditorMode
  /** Brouillon créé d'office (premier lancement, dernier CV supprimé) : gardé en mémoire seulement, jamais écrit dans localStorage, tant qu'on ne l'enregistre pas. */
  draft?: true
}
export type CVDoc = DocBase & { kind: 'cv'; data: CV }
export type LetterDoc = DocBase & { kind: 'letter'; data: Letter }
export type Doc = CVDoc | LetterDoc
