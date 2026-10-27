import { Text, View } from '@react-pdf/renderer'
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

/** Texte lisible (blanc ou encre) sur un fond de couleur libre. */
export function onAccent(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const lin = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2] > 0.4 ? '#1f1b16' : '#ffffff'
}

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
export function SkillLevel({ it, t, color = t.accent, track, width = 54 }: { it: Item; t: Theme; color?: string; track?: string; width?: number }) {
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
export function Lines({ text, rtl }: { text: string; rtl: boolean }) {
  return (
    <>
      {text.split('\n').filter((l) => l.trim()).map((l, i) => {
        const bullet = /^\s*[-•*]\s+/.test(l)
        const body = fixBidi(l.replace(/^\s*[-•*]\s+/, ''), rtl)
        if (rtl || !bullet) return <Text key={i} style={{ marginTop: 1.5 }}>{body}</Text>
        return (
          <View key={i} style={{ flexDirection: 'row', marginTop: 1.5 }}>
            <Text style={{ width: 10 }}>•</Text>
            <Text style={{ flex: 1 }}>{body}</Text>
          </View>
        )
      })}
    </>
  )
}

/** Contacts en rangée qui passe à la ligne sans casser un élément ; `color` pour les fonds colorés. */
export function ContactRow({ items, rtl, style, center }: { items: string[]; rtl: boolean; style: { color: string; fontSize: number }; center?: boolean }) {
  return (
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 2, ...(center ? { justifyContent: 'center' } : {}) }}>
      {items.map((c, i) => <Text key={i} style={style}>{c}</Text>)}
    </View>
  )
}
