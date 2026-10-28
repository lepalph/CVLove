import { fullName, visibleFields, visibleSections } from '../model/cv'
import { sampleCV } from '../model/sample'
import { LANGS, type CV, type Lang } from '../model/types'
import type { TemplateDef } from '../templates/types'

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

/** Rapport de contraste WCAG entre deux couleurs `#rrggbb`. */
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Couleur du cœur du logo : l'accent du document s'il se voit (3:1 pour un élément graphique) sur le fond, sinon `undefined` (couleur de marque). */
export const logoAccent = (accent: string | undefined, bg: string) =>
  accent && /^#[0-9a-f]{6}$/i.test(accent) && contrast(accent, bg) >= 3 ? accent : undefined

/** Nombre de ressources chargées depuis une autre origine que `origin` (http et https seulement : data: et blob: restent locaux). */
export const externalCount = (names: string[], origin: string) =>
  names.filter((n) => /^https?:/.test(n) && new URL(n).origin !== origin).length

/** Premier mot d'un nom d'étape (« Compétences et langues » devient « Compétences »). */
export const shortStep = (name: string) => name.split(/\s+/)[0]

const SAMPLE_NAMES = new Set(LANGS.map((l) => fullName(sampleCV(l))))
/** Le CV porte encore le nom de l'exemple (Camille, Laila…) : il vient des données d'exemple, pas de la personne. */
export const isExampleCV = (cv: CV) => SAMPLE_NAMES.has(fullName(cv))
/** Rien à imprimer : ni nom, ni coordonnées, ni section remplie. */
export const isEmptyCV = (cv: CV) => !fullName(cv) && !cv.personal.title.trim() && !visibleFields(cv).length && !visibleSections(cv).length

/** Nom d'un modèle : en français « Classique · Académique » ; ailleurs « Classic 2 » (les noms de style restent français). */
export const modelName = (m: TemplateDef, lang: Lang) =>
  lang === 'fr' ? `${m.layoutName.fr} · ${m.styleName}` : `${m.layoutName[lang]} ${m.styleNo}`
