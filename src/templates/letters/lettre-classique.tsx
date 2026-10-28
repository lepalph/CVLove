import { Document, Page, Text, View } from '@react-pdf/renderer'
import { cvLabels } from '../../i18n/labels'
import { ContactRow } from '../shared'
import { Block, MUTED, Main, ink, placeDate, recipientLines, senderLines } from '../letterShared'
import { makeTheme } from '../theme'
import type { LetterMeta, LetterProps } from '../types'

export const meta: LetterMeta = {
  id: 'lettre-classique',
  order: 1,
  name: { fr: 'Classique', en: 'Classic', es: 'Clásica', de: 'Klassisch', it: 'Classica', pt: 'Clássica', ar: 'كلاسيكية' },
}

/** Nom et coordonnées en tête, filet d'accent dessous ; destinataire et date du côté de fin. */
export function Component({ letter, design, labels }: LetterProps) {
  const t = makeTheme(letter, design, cvLabels[letter.lang])
  const accent = ink(t.accent)
  const { sender } = letter
  return (
    <Document title={letter.subject.trim() || sender.name} author={sender.name}>
      <Page {...t.pageProps} style={t.pageStyle(54, 60)}>
        <View style={{ paddingBottom: t.m(8), borderBottomWidth: 0.8, borderBottomColor: t.accent }}>
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(22), lineHeight: 1.2, color: accent }}>{sender.name}</Text>
          {!!sender.title.trim() && <Text style={{ fontSize: t.s(11), marginTop: 2 }}>{sender.title}</Text>}
          {senderLines(letter).length > 0 && (
            <View style={{ marginTop: 6 }}><ContactRow items={senderLines(letter)} rtl={t.rtl} style={{ color: MUTED, fontSize: t.s(9.5) }} /></View>
          )}
        </View>
        <View style={{ marginTop: t.m(30), fontSize: t.s(10.5) }}>
          <Block t={t} lines={recipientLines(letter)} bold={1} side="end" />
          {!!placeDate(letter) && <Text style={{ marginTop: t.m(18), alignSelf: t.rtl ? 'flex-start' : 'flex-end', textAlign: t.start }}>{placeDate(letter)}</Text>}
        </View>
        <Main t={t} letter={letter} labels={labels} accent={accent} />
      </Page>
    </Document>
  )
}
