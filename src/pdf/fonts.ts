import { Font } from '@react-pdf/renderer'
import { isRtl } from '../model/dates'
import type { Lang } from '../model/types'

/**
 * Polices statiques (react-pdf ne gère pas les axes variables) : voir scripts/make-fonts.py.
 * `base` : préfixe d'URL (navigateur) ou chemin disque (Node, check:pdf).
 * Césure désactivée (sinon coupures sauvages, surtout en arabe).
 */
let done = false
export function registerFonts(base: string) {
  if (done) return
  done = true
  const f = (family: string, file: string, fontWeight: number) => ({ src: `${base}${file}`, fontWeight })
  Font.register({ family: 'Inter', fonts: [f('Inter', 'Inter-Regular.ttf', 400), f('Inter', 'Inter-SemiBold.ttf', 600)] })
  Font.register({ family: 'CVLoveSerif', fonts: [f('s', 'CVLoveSerif-Regular.ttf', 400), f('s', 'CVLoveSerif-Bold.ttf', 700)] })
  Font.register({ family: 'Tajawal', fonts: [f('a', 'Tajawal-Regular.ttf', 400), f('a', 'Tajawal-Bold.ttf', 700)] })
  Font.registerHyphenationCallback((w) => [w])
}

/**
 * Police selon la langue : l'arabe utilise Tajawal partout (titres compris).
 * Pourquoi pas Tajawal : react-pdf (fontkit 2.0.4) ne place pas correctement les points (marques GPOS
 * séparées par ccmp) de Noto : ج initial amputé, points de ي final décalés. Tajawal (points intégrés aux glyphes)
 * s'affiche correctement ; le chaînage des lettres et l'ordre RTL sont bons avec les deux.
 * Limite restante : le texte EXTRAIT du PDF arabe est incorrect (table ToUnicode de react-pdf) -> pas de
 * copier-coller ni d'ATS fiables en arabe. Rendu visuel OK.
 */
export const fontFor = (lang: Lang, role: 'sans' | 'serif') =>
  lang === 'ar' ? 'Tajawal' : role === 'serif' ? 'CVLoveSerif' : 'Inter'

/** Style de base d'une page : police + sens de lecture. */
export const bodyStyle = (lang: Lang) => ({
  fontFamily: fontFor(lang, 'sans'),
  fontSize: 9.5,
  lineHeight: lang === 'ar' ? 1.55 : 1.4, // l'arabe a de grands jambages et des diacritiques
  color: '#1f1b16',
  ...(isRtl(lang) ? { direction: 'rtl' as const, textAlign: 'right' as const } : {}),
})
