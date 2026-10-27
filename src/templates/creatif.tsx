import type { ReactNode } from 'react'
import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import { sectionTitle } from '../i18n/labels'
import { fullName, visibleSections } from '../model/cv'
import { formatPeriod, isRtl } from '../model/dates'
import type { Item, Section } from '../model/types'
import { bodyStyle } from '../pdf/fonts'
import { ContactRow, Lines, contactList, fixBidi } from './shared'
import type { TemplateProps } from './types'

const MUTED = '#6b645b'
const META = 104 // colonne étroite de dates / métadonnées
const PAD_V = 38
const PAD_H = 44

export function Component({ cv, labels }: TemplateProps) {
  const { lang, accent, personal } = cv
  const rtl = isRtl(lang)
  const row = rtl ? 'row-reverse' : 'row'
  const contacts = contactList(cv, labels)

  // Rangée « métadonnées | contenu » : largeur fixe à gauche (à droite en RTL), le contenu dans une View flex:1.
  const line = (key: string, meta: ReactNode, content: ReactNode, top = 6) => (
    <View key={key} wrap={false} style={{ flexDirection: row, marginTop: top, gap: 14 }}>
      <View style={{ width: META }}>{meta}</View>
      <View style={{ flex: 1 }}>{content}</View>
    </View>
  )

  const entry = (it: Item) => {
    const period = formatPeriod(it, lang, labels.present)
    return line(
      it.id,
      <>
        {!!period && <Text style={{ color: accent, fontSize: 8.5 }}>{period}</Text>}
        {!!it.place.trim() && <Text style={{ color: MUTED, fontSize: 8.5, marginTop: 1 }}>{it.place}</Text>}
      </>,
      <>
        <Text style={{ fontWeight: 700, fontSize: 10.5 }}>{it.title}</Text>
        {!!it.subtitle.trim() && <Text style={{ color: MUTED }}>{it.subtitle}</Text>}
        {!!it.text.trim() && <Lines text={it.text} rtl={rtl} />}
      </>,
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return line(s.id, null, <Text>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), rtl)}</Text>)
    if (s.kind === 'interests') return line(s.id, null, <Text>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>)
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) => line(it.id, <Text style={{ fontWeight: 700 }}>{it.title}</Text>, <Text>{fixBidi(it.text, rtl)}</Text>, 5))
    return s.items.map(entry)
  }

  return (
    <Document title={fullName(cv)} author={fullName(cv)}>
      <Page size="A4" style={{ ...bodyStyle(lang), paddingVertical: PAD_V, paddingHorizontal: PAD_H }}>
        {/* En-tête en aplat plein format : marges négatives pour ne pas dépendre du padding (la page 2 garde le sien) */}
        <View
          style={{
            marginTop: -PAD_V, marginHorizontal: -PAD_H, paddingVertical: 28, paddingHorizontal: PAD_H,
            backgroundColor: accent, flexDirection: row, alignItems: 'center', gap: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ffffff', fontWeight: 700, fontSize: 34, lineHeight: 1.1 }}>{fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ color: '#ffffff', fontSize: 13, marginTop: 6 }}>{personal.title}</Text>}
            {contacts.length > 0 && <View style={{ marginTop: 12 }}><ContactRow items={contacts} rtl={rtl} style={{ color: '#ffffff', fontSize: 9 }} /></View>}
          </View>
          {!!personal.photo && <Image src={personal.photo} style={{ width: 92, height: 92, borderRadius: 6, objectFit: 'cover' }} />}
        </View>
        {visibleSections(cv).map((s) => (
          <View key={s.id} style={{ marginTop: 13 }}>
            <View minPresenceAhead={90} style={{ flexDirection: row, alignItems: 'center', gap: 8 }}>
              <View style={{ width: 16, height: 4, backgroundColor: accent }} />
              <Text style={{ fontWeight: 700, fontSize: 12, color: accent }}>{sectionTitle(s, labels)}</Text>
            </View>
            {body(s)}
          </View>
        ))}
      </Page>
    </Document>
  )
}
