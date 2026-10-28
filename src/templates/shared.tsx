import { Children, Fragment, isValidElement, type ReactNode } from 'react'
import { Text as PdfText, View, type TextProps, type ViewProps } from '@react-pdf/renderer'
import type { CVLabels } from '../i18n/labels'
import { visibleFields } from '../model/cv'
import { formatDay, formatPeriod } from '../model/dates'
import type { CV, Item } from '../model/types'
import type { Theme } from './theme'

/**
 * Bidi : en arabe, « 18٪ » ou « 18% » en fin de ligne perd son signe (le % est neutre et ET collé à un chiffre
 * devient un chiffre : il part en début de ligne). Une marque RLM (U+200F) juste après le signe le rattache au nombre.
 * Les mots latins au milieu de l'arabe (« TypeScript و Node ») s'ordonnent bien sans aide. Isolats U+2066..2069 : à éviter, react-pdf affiche des glyphes parasites.
 */
// En LTR, espace insécable avant % pour que « 80 % » ne se coupe pas en fin de ligne.
export const fixBidi = (s: string, rtl: boolean) =>
  rtl ? s.replace(/(\d\s?[%٪])/g, '$1‏') : s.replace(/(\d) %/g, '$1\u00A0%')

const textOf = (n: ReactNode): string =>
  Children.toArray(n).map((c) => (isValidElement<{ children?: ReactNode }>(c) ? textOf(c.props.children) : String(c))).join('')

/**
 * <Text> de react-pdf avec la direction du PARAGRAPHE déduite de son contenu (comme `dir="auto"`) : react-pdf n'hérite pas `direction`
 * de la page, donc sans cela chaque paragraphe est résolu en LTR et un paragraphe arabe + latin qui passe à la ligne se mélange.
 * Tout texte des mises en page passe par ce composant.
 */
const RTL_CHARS = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/

export function Text(props: TextProps & { children?: ReactNode }) {
  const rtl = RTL_CHARS.test(textOf(props.children))
  return rtl ? <PdfText {...props} style={[{ direction: 'rtl' }, props.style ?? {}]} /> : <PdfText {...props} />
}

/** Contacts en texte, un par champ visible. */
export const contactList = (cv: CV, labels: CVLabels) =>
  visibleFields(cv).map((f) =>
    f.kind === 'birthDate' ? `${labels.born} ${formatDay(f.value, cv.lang)}`
    : f.kind === 'custom' && f.label?.trim() ? `${f.label.trim()} : ${f.value}`
    : f.value,
  )

/** Mélange hex -> blanc (t = part de blanc, 0..1) : fond teinté dérivé de l'accent. */
export function tint(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** Assombrit un hex (t = part de noir, 0..1). */
export function shade(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - t)))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Rapport de contraste WCAG entre deux couleurs hex (1 à 21). */
export const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/**
 * Accent utilisable comme couleur de TEXTE : assombri jusqu'à `min`:1 contre `bg` (accent libre, très clair compris).
 * 4,5 (défaut) pour du texte sur blanc ; `ink(accent, '#ffffff', 7)` pour un aplat qui porte du texte blanc.
 */
export function ink(hex: string, bg = '#ffffff', min = 4.5) {
  for (let i = 0; i <= 20; i++) {
    const c = shade(hex, i * 0.05)
    if (contrast(c, bg) >= min) return c
  }
  return '#000000'
}

/** Texte lisible (blanc ou encre) sur un fond de couleur libre : celui des deux qui contraste le plus. */
export const onAccent = (hex: string) => (contrast(hex, '#ffffff') >= contrast(hex, '#1f1b16') ? '#ffffff' : '#1f1b16')

/** Période + « sous-titre · lieu » d'un item. */
export function entryMeta(it: Item, cv: CV, labels: CVLabels) {
  return {
    period: formatPeriod(it, cv.lang, labels.present),
    sub: [it.subtitle, it.place].filter((x) => x.trim()).join(' · '),
  }
}

/**
 * Niveau 1-5 d'une compétence ou d'une langue, selon design.skillDisplay : barres, points, ou mot (si l'item n'a pas de texte libre).
 * `color` / `track` : trait plein / trait vide, à fournir sur un fond coloré. Rien si l'item n'a pas de niveau.
 */
export function SkillLevel({ it, t, color = ink(t.accent), track, width = 54 }: { it: Item; t: Theme; color?: string; track?: string; width?: number }) {
  const level = Math.max(0, Math.min(5, Math.round(it.level ?? 0)))
  if (!level) return null
  const empty = track ?? tint(color, 0.78)
  const mode = t.design.skillDisplay
  if (mode === 'text')
    return it.text.trim() ? null : <Text style={{ color, fontSize: t.s(8.5) }}>{t.labels.levels[level - 1]}</Text>
  const dots = mode === 'dots'
  const gap = dots ? 3 : 2
  const w = dots ? 5 : (width - gap * 4) / 5
  return (
    <View style={{ flexDirection: t.row, gap }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ width: w, height: dots ? 5 : 3.5, borderRadius: dots ? 2.5 : 1, backgroundColor: i <= level ? color : empty }} />
      ))}
    </View>
  )
}

/** Lignes d'une description ; « - » ou « • » en début de ligne = puce (jamais en RTL : react-pdf la place à gauche). */
export const lineNodes = (text: string, rtl: boolean) =>
  text.split('\n').filter((l) => l.trim()).map((l, i) => {
    const bullet = /^\s*[-•*]\s+/.test(l)
    const body = fixBidi(l.replace(/^\s*[-•*]\s+/, ''), rtl)
    if (rtl || !bullet || RTL_CHARS.test(l)) return <Text key={i} style={{ marginTop: 1.5 }}>{body}</Text>
    return (
      <View key={i} wrap={false} style={{ flexDirection: 'row', marginTop: 1.5 }}>
        <Text style={{ width: 10 }}>•</Text>
        <Text style={{ flex: 1 }}>{body}</Text>
      </View>
    )
  })

export const Lines = ({ text, rtl }: { text: string; rtl: boolean }) => <>{lineNodes(text, rtl)}</>

/**
 * Description d'un poste : `head` (titre, période...) et la 1re ligne restent ensemble, le reste peut passer à la page suivante.
 * Un poste long ne repousse plus la page entière (blancs, 8 pages) et un titre ne reste jamais seul sous un en-tête de section.
 */
export function Entry({ head, text, rtl, style }: { head: ReactNode; text: string; rtl: boolean; style?: ViewProps['style'] }) {
  const [first, ...rest] = lineNodes(text, rtl)
  return (
    <View style={style}>
      <View wrap={false}>{head}{first}</View>
      {rest}
    </View>
  )
}

/**
 * Section à plat dans le flux de la page : le titre (porteur de la marge haute) et le contenu sont des frères directs. `minPresenceAhead` ne
 * joue qu'entre frères : dans une View de section, un titre pouvait rester seul en bas de page, son contenu sur la page suivante.
 */
export const SectionFlow = ({ gap, title, children }: { gap: number; title: ReactNode; children: ReactNode }) => (
  <Fragment>
    <View minPresenceAhead={70} style={{ marginTop: gap }}>{title}</View>
    {children}
  </Fragment>
)

/** Contacts en rangée qui passe à la ligne sans casser un élément ; `color` pour les fonds colorés. */
export function ContactRow({ items, rtl, style, center }: { items: string[]; rtl: boolean; style: { color: string; fontSize: number }; center?: boolean }) {
  return (
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 2, ...(center ? { justifyContent: 'center' } : {}) }}>
      {items.map((c, i) => <Text key={i} style={{ ...style, textAlign: rtl ? 'right' : 'left' }}>{c}</Text>)}
    </View>
  )
}
