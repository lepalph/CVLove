import { Children, Fragment, cloneElement, isValidElement, type ReactNode } from 'react'
import { Text as PdfText, View, type TextProps, type ViewProps } from '@react-pdf/renderer'
import type { CVLabels } from '../i18n/labels'
import { visibleFields } from '../model/cv'
import { formatDay, formatPeriod } from '../model/dates'
import { CEFR, type CV, type Item } from '../model/types'
import { cefrText } from '../i18n/cefr'
import type { Theme } from './theme'

/**
 * Bidi : pas de marque RLM (U+200F) en arabe : Tajawal n'a pas ce glyphe, la ligne qui la porte devenait plus haute que ses voisines
 * (ligne « décalée », puces désalignées) ; « 18٪ » en fin de ligne garde son signe sans elle. Isolats U+2066..2069 : à éviter, react-pdf affiche des glyphes parasites.
 */
// En LTR, espace insécable avant % pour que « 80 % » ne se coupe pas en fin de ligne.
export const fixBidi = (s: string, rtl: boolean) =>
  rtl ? s : s.replace(/(\d) %/g, '$1\u00A0%')

const textOf = (n: ReactNode): string =>
  Children.toArray(n).map((c) => (isValidElement<{ children?: ReactNode }>(c) ? textOf(c.props.children) : String(c))).join('')

/**
 * <Text> de react-pdf avec la direction du PARAGRAPHE déduite de son contenu (comme `dir="auto"`) : react-pdf n'hérite pas `direction`
 * de la page, donc sans cela chaque paragraphe est résolu en LTR et un paragraphe arabe + latin qui passe à la ligne se mélange.
 * Tout texte des mises en page passe par ce composant.
 */
const RTL_CHARS = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/

// Tajawal n'a ni le séparateur décimal arabe (U+066B) ni celui des milliers (U+066C) : le repli de react-pdf les rendait en gras et déformés.
const ar = (n: ReactNode): ReactNode =>
  typeof n === 'string' ? n.replace(/\u066B/g, '.').replace(/\u066C/g, ',')
  : isValidElement<{ children?: ReactNode }>(n) ? cloneElement(n, undefined, Children.map(n.props.children, ar)) : n

export function Text(props: TextProps & { children?: ReactNode }) {
  const rtl = RTL_CHARS.test(textOf(props.children))
  return rtl ? <PdfText {...props} style={[{ direction: 'rtl' }, props.style ?? {}]}>{Children.map(props.children, ar)}</PdfText> : <PdfText {...props} />
}

/** Séparateur « libellé : valeur » : espace insécable avant les deux-points en français seulement. */
export const colon = (lang: string) => (lang === 'fr' ? '\u00A0: ' : ': ')

const URL_RE = /^(https?:\/\/\S+|(www\.)?[\w-]+(\.[\w-]+)+\/\S*)$/i

/** Valeur cliquable (mailto:, tel:, lien) sans changer l'apparence du texte ; `kind` absent = détection sur la valeur. */
// <Text src> = annotation Link sans le style bleu souligné de <Link> (la couleur du texte parent est héritée) ; absent des types de react-pdf.
export function linked(value: string, kind?: string): ReactNode {
  const v = value.trim()
  let href = ''
  if ((kind === 'email' || !kind) && /^[^\s@?&]+@[^\s@?&]+\.[^\s@?&]+$/.test(v)) href = `mailto:${v}` // pas de « ?bcc= » glissé dans le lien
  else if (kind === 'phone' || (!kind && /^\+?[\d\s().-]{7,}$/.test(v))) { const d = v.replace(/[^\d+]/g, ''); if (d) href = `tel:${d}` }
  else if ((kind === 'website' || kind === 'custom' || !kind) && URL_RE.test(v)) href = /^https?:/i.test(v) ? v : `https://${v}`
  else if (kind === 'website' && /^[\w-]+(\.[\w-]+)+$/.test(v)) href = `https://${v}`
  return href ? <PdfText {...({ src: href } as object)}>{value}</PdfText> : value
}

/** Contacts, un par champ visible (valeur cliquable si e-mail, téléphone ou lien). */
export const contactList = (cv: CV, labels: CVLabels): ReactNode[] =>
  visibleFields(cv).map((f) =>
    f.kind === 'birthDate' ? `${labels.born} ${formatDay(f.value, cv.lang)}`
    : f.kind === 'custom' && f.label?.trim() ? <>{f.label.trim()}{colon(cv.lang)}{linked(f.value, 'custom')}</>
    : linked(f.value, f.kind),
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
    period: formatPeriod(it, cv.lang, labels.present).replace(/ /g, '\u00A0'), // insécable : « mars 2019 – Présent » ne se coupe jamais
    sub: [it.subtitle, it.place].filter((x) => x.trim()).join(' · '),
  }
}

/** Élément court d'une colonne latérale (certification) : titre en gras, puis « organisme · date ». `soft` : couleur de la 2e ligne. */
export function SideEntry({ it, cv, labels, t, color, soft = color }: { it: Item; cv: CV; labels: CVLabels; t: Theme; color?: string; soft?: string }) {
  const { period, sub } = entryMeta(it, cv, labels)
  const line = [sub, period].filter(Boolean).join(' · ')
  return (
    <View wrap={false} style={{ marginTop: t.m(4) }}>
      <Text style={{ fontWeight: 700, color }}>{it.title}</Text>
      {!!line && <Text style={{ color: soft }}>{line}</Text>}
    </View>
  )
}

/**
 * Niveau 1-5 d’une compétence ou d’une langue, selon design.skillDisplay : barres, points ou mot.
 * `color` / `track` : trait plein / trait vide, à fournir sur un fond coloré. Rien si l'item n'a pas de niveau.
 */
export function SkillLevel({ it, t, color = ink(t.accent), track, width = 54 }: { it: Item; t: Theme; color?: string; track?: string; width?: number }) {
  const n = it.cefr ? CEFR.length : 5 // langues : 7 crans du CECRL ; compétences : 5
  const level = it.cefr ? CEFR.indexOf(it.cefr) + 1 : Math.max(0, Math.min(5, Math.round(it.level ?? 0)))
  if (!level) return null
  const empty = track ?? tint(color, 0.78)
  const mode = t.design.skillDisplay
  if (mode === 'text') return <Text style={{ color, fontSize: t.s(8.5) }}>{it.cefr ? cefrText(it.cefr, t.lang) : t.labels.levels[level - 1]}</Text>
  const dots = mode === 'dots'
  const gap = dots ? 3 : 2
  const w = dots ? 5 : (width - gap * (n - 1)) / n
  return (
    <View style={{ flexDirection: t.row, gap }}>
      {Array.from({ length: n }, (_, k) => k + 1).map((i) => (
        <View key={i} style={{ width: w, height: dots ? 5 : 3.5, borderRadius: dots ? 2.5 : 1, backgroundColor: i <= level ? color : empty }} />
      ))}
    </View>
  )
}

/** Lignes d'une description ; « - » ou « • » en début de ligne = puce. En RTL la puce est un disque dessiné, côté début (à droite) : le glyphe « • » serait mal placé par react-pdf. */
export const lineNodes = (text: string, rtl: boolean) =>
  text.split('\n').filter((l) => l.trim()).map((l, i) => {
    const bullet = /^\s*[-•*]\s+/.test(l)
    const body = fixBidi(l.replace(/^\s*[-•*]\s+/, ''), rtl)
    if (!bullet) return <Text key={i} style={{ marginTop: 1.5 }}>{body}</Text>
    const arabic = rtl || RTL_CHARS.test(l)
    return (
      <View key={i} wrap={false} style={{ flexDirection: arabic ? 'row-reverse' : 'row', marginTop: 1.5 }}>
        {arabic ? <View style={{ width: 10, paddingTop: 4.5, alignItems: 'flex-end' }}><View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#1f1b16' }} /></View> : <Text style={{ width: 10 }}>•</Text>}
        <Text style={{ flex: 1 }}>{body}</Text>
      </View>
    )
  })

export const Lines = ({ text, rtl }: { text: string; rtl: boolean }) => <>{lineNodes(text, rtl)}</>

/**
 * Description d'un poste : `head` (titre, période...) et les 2 premières lignes restent ensemble, le reste peut passer à la page suivante.
 * Un poste long ne repousse plus la page entière (blancs, 8 pages) et un titre ne reste jamais seul sous un en-tête de section.
 */
export function Entry({ head, text, rtl, style }: { head: ReactNode; text: string; rtl: boolean; style?: ViewProps['style'] }) {
  const nodes = lineNodes(text, rtl)
  // Entrée courte (~1/3 de page max) : jamais coupée ; sinon l'en-tête part avec ses 2 premières lignes.
  const short = text.length < 600 && nodes.length <= 4
  return (
    <View style={style} wrap={!short}>
      <View wrap={false}>{head}{nodes.slice(0, 2)}</View>
      {nodes.slice(2)}
    </View>
  )
}

/**
 * Section à plat dans le flux de la page : le titre (porteur de la marge haute) et le contenu sont des frères directs. `minPresenceAhead` ne
 * joue qu'entre frères : dans une View de section, un titre pouvait rester seul en bas de page, son contenu sur la page suivante.
 */
export const SectionFlow = ({ gap, title, children }: { gap: number; title: ReactNode; children: ReactNode }) => (
  <Fragment>
    <View minPresenceAhead={120} style={{ marginTop: gap }}>{title}</View>
    {children}
  </Fragment>
)

/** Contacts en rangée qui passe à la ligne sans casser un élément ; `color` pour les fonds colorés. */
export function ContactRow({ items, rtl, style, center }: { items: ReactNode[]; rtl: boolean; style: { color: string; fontSize: number }; center?: boolean }) {
  return (
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 2, ...(center ? { justifyContent: 'center' } : {}) }}>
      {items.map((c, i) => <Text key={i} style={{ ...style, textAlign: rtl ? 'right' : 'left' }}>{c}</Text>)}
    </View>
  )
}
