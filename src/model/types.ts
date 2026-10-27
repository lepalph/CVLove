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
 * - skills : title = groupe, text = liste ; languages : title = langue, text = niveau
 * - interests : title
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

export interface CV {
  lang: Lang
  templateId: string
  accent: string
  personal: Personal
  sections: Section[]
}
