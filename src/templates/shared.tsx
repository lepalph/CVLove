import { Text, View } from '@react-pdf/renderer'
import type { CVLabels } from '../i18n/labels'
import { visibleFields } from '../model/cv'
import { formatDay } from '../model/dates'
import type { CV } from '../model/types'

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
export function ContactRow({ items, rtl, style }: { items: string[]; rtl: boolean; style: { color: string; fontSize: number } }) {
  return (
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 2 }}>
      {items.map((c, i) => <Text key={i} style={style}>{c}</Text>)}
    </View>
  )
}
