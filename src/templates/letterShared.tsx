import { View } from '@react-pdf/renderer'
import type { LetterLabels } from '../i18n/letter'
import { formatDay } from '../model/dates'
import { paragraphs } from '../model/letter'
import type { Letter } from '../model/types'
import { Text, fixBidi } from './shared'
import type { Theme } from './theme'

export const MUTED = '#5c564d'

/** Coordonnées de l'expéditeur, une par ligne (vides écartées). */
export const senderLines = (l: Letter) => [l.sender.address, l.sender.email, l.sender.phone].map((x) => x.trim()).filter(Boolean)

/** « Lyon, 12 mars 2026 » (lieu et date facultatifs). */
export const placeDate = (l: Letter) => [l.place.trim(), formatDay(l.date, l.lang)].filter(Boolean).join(l.lang === 'ar' ? '، ' : ', ')

/** Bloc de lignes (nom en gras, puis le reste) ; `side` = côté de la page où poser le bloc. */
export function Block({ t, lines, bold = 0, side }: { t: Theme; lines: string[]; bold?: number; side?: 'start' | 'end' }) {
  if (!lines.length) return null
  const self = side === 'end' ? (t.rtl ? 'flex-start' : 'flex-end') : side === 'start' ? (t.rtl ? 'flex-end' : 'flex-start') : undefined
  return (
    <View style={{ ...(self ? { alignSelf: self } : {}), textAlign: t.start }}>
      {lines.flatMap((x) => x.split('\n')).filter((x) => x.trim()).map((x, i) => (
        <Text key={i} style={{ fontWeight: i < bold ? 700 : 400, textAlign: t.start }}>{x}</Text>
      ))}
    </View>
  )
}

export const recipientLines = (l: Letter) => [l.recipient.name, l.recipient.company, l.recipient.address].map((x) => x.trim()).filter(Boolean)

/** Objet, formule d'appel, paragraphes, politesse et signature. La politesse et la signature ne se séparent pas. */
export function Main({ t, letter, labels, accent }: { t: Theme; letter: Letter; labels: LetterLabels; accent: string }) {
  const sep = letter.lang === 'fr' ? ' : ' : ': '
  const gap = { marginTop: t.m(9), textAlign: t.start }
  return (
    <View style={{ fontSize: t.s(10.5) }}>
      {!!letter.subject.trim() && (
        <Text style={{ fontWeight: 700, marginTop: t.m(20), textAlign: t.start }}>
          <Text style={{ color: accent }}>{labels.subject}{sep}</Text>{fixBidi(letter.subject.trim(), t.rtl)}
        </Text>
      )}
      {!!letter.salutation.trim() && <Text style={{ ...gap, marginTop: t.m(18) }}>{letter.salutation.trim()}</Text>}
      {paragraphs(letter.body).map((p, i) => <Text key={i} style={gap}>{fixBidi(p, t.rtl)}</Text>)}
      {(!!letter.closing.trim() || !!letter.signature.trim()) && (
        <View wrap={false} style={{ marginTop: t.m(18) }}>
          {!!letter.closing.trim() && <Text style={{ textAlign: t.start }}>{letter.closing.trim()}</Text>}
          {!!letter.signature.trim() && (
            <Text style={{ marginTop: t.m(28), fontFamily: t.head, fontWeight: 700, textAlign: t.start }}>{letter.signature.trim()}</Text>
          )}
        </View>
      )}
    </View>
  )
}
