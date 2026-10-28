import { Document, Page, Text, View } from '@react-pdf/renderer'
import { cvLabels } from '../../i18n/labels'
import { tint } from '../shared'
import { Block, Main, ink, placeDate, recipientLines, senderLines } from '../letterShared'
import { makeTheme } from '../theme'
import type { LetterMeta, LetterProps } from '../types'

export const meta: LetterMeta = {
  id: 'lettre-lateral',
  order: 3,
  name: { fr: 'Latérale', en: 'Sidebar', es: 'Lateral', de: 'Seitenleiste', it: 'Laterale', pt: 'Lateral', ar: 'جانبية' },
}

const SIDE = 150

/** Colonne teintée sur toute la hauteur (chaque page) avec l'expéditeur sur la première ; le texte occupe le reste. En arabe, la colonne est à droite. */
export function Component({ letter, design, labels }: LetterProps) {
  const t = makeTheme(letter, design, cvLabels[letter.lang])
  const bg = tint(t.accent, 0.9)
  const accent = ink(t.accent, bg)
  const { sender } = letter
  const pad = t.m(22)
  const { paddingHorizontal: _h, ...page } = t.pageStyle(48, 0)
  const side = t.start // 'left' en LTR, 'right' en RTL
  const edge = t.end
  const cap = side === 'left' ? 'Left' : 'Right'
  const capEnd = edge === 'left' ? 'Left' : 'Right'
  return (
    <Document title={letter.subject.trim() || sender.name} author={sender.name}>
      <Page {...t.pageProps} style={{ ...page, [`padding${cap}`]: SIDE + pad, [`padding${capEnd}`]: t.m(44) }}>
        <View fixed style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: SIDE, backgroundColor: bg }} />
        <View style={{ position: 'absolute', top: t.m(48), [side]: 0, width: SIDE, paddingHorizontal: t.m(16), gap: 8 }}>
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(15), lineHeight: 1.2, color: accent, textAlign: t.start }}>{sender.name}</Text>
          {!!sender.title.trim() && <Text style={{ fontSize: t.s(9.5), textAlign: t.start }}>{sender.title}</Text>}
          <View style={{ height: 1.5, width: 28, backgroundColor: t.accent, alignSelf: t.rtl ? 'flex-end' : 'flex-start' }} />
          {senderLines(letter).map((x, i) => <Text key={i} style={{ fontSize: t.s(9), textAlign: t.start }}>{x}</Text>)}
        </View>
        <View style={{ fontSize: t.s(10.5) }}>
          {!!placeDate(letter) && <Text style={{ textAlign: t.start }}>{placeDate(letter)}</Text>}
          <View style={{ marginTop: t.m(18) }}><Block t={t} lines={recipientLines(letter)} bold={1} /></View>
        </View>
        <Main t={t} letter={letter} labels={labels} accent={accent} />
      </Page>
    </Document>
  )
}
