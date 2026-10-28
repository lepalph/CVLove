import { Document, Page, Text, View } from '@react-pdf/renderer'
import { cvLabels } from '../../i18n/labels'
import { ContactRow, onAccent } from '../shared'
import { Block, Main, ink, placeDate, recipientLines, senderLines } from '../letterShared'
import { makeTheme } from '../theme'
import type { LetterMeta, LetterProps } from '../types'

export const meta: LetterMeta = {
  id: 'lettre-bandeau',
  order: 2,
  name: { fr: 'Bandeau', en: 'Banner', es: 'Banda', de: 'Banner', it: 'Banda', pt: 'Faixa', ar: 'شريط' },
}

/** Bandeau d'accent arrondi en tête (comme les CV Moderne et Blocs) ; destinataire au début, date à la fin, sur une même ligne. */
export function Component({ letter, design, labels }: LetterProps) {
  const t = makeTheme(letter, design, cvLabels[letter.lang])
  const bg = ink(t.accent, '#ffffff', 7)
  const fg = onAccent(bg)
  const { sender } = letter
  const accent = ink(t.accent)
  return (
    <Document title={letter.subject.trim() || sender.name} author={sender.name}>
      <Page {...t.pageProps} style={t.pageStyle(44, 48)}>
        <View style={{ backgroundColor: bg, borderRadius: 6, paddingVertical: t.m(16), paddingHorizontal: t.m(18) }}>
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(21), lineHeight: 1.2, color: fg }}>{sender.name}</Text>
          {!!sender.title.trim() && <Text style={{ fontSize: t.s(11), marginTop: 2, color: fg }}>{sender.title}</Text>}
          {senderLines(letter).length > 0 && (
            <View style={{ marginTop: 7 }}><ContactRow items={senderLines(letter)} rtl={t.rtl} style={{ color: fg, fontSize: t.s(9.5) }} /></View>
          )}
        </View>
        <View style={{ marginTop: t.m(28), flexDirection: t.row, justifyContent: 'space-between', gap: 20, fontSize: t.s(10.5) }}>
          <View style={{ flex: 1 }}><Block t={t} lines={recipientLines(letter)} bold={1} /></View>
          {!!placeDate(letter) && <Text style={{ textAlign: t.end }}>{placeDate(letter)}</Text>}
        </View>
        <Main t={t} letter={letter} labels={labels} accent={accent} />
      </Page>
    </Document>
  )
}
