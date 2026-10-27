import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import { sectionTitle } from '../i18n/labels'
import { fullName, visibleSections } from '../model/cv'
import { formatPeriod, isRtl } from '../model/dates'
import type { Item, Section } from '../model/types'
import { bodyStyle } from '../pdf/fonts'
import { ContactRow, Lines, contactList, fixBidi } from './shared'
import type { TemplateProps } from './types'

const MUTED = '#77716a'

export function Component({ cv, labels }: TemplateProps) {
  const { lang, accent, personal } = cv
  const rtl = isRtl(lang)
  const row = rtl ? 'row-reverse' : 'row'
  const contacts = contactList(cv, labels)

  const entry = (it: Item) => {
    const period = formatPeriod(it, lang, labels.present)
    const sub = [it.subtitle, it.place].filter((x) => x.trim()).join(' · ')
    return (
      <View key={it.id} wrap={false} style={{ marginTop: 8 }}>
        <View style={{ flexDirection: row, justifyContent: 'space-between', gap: 10 }}>
          <View style={{ flex: 1 }}><Text style={{ fontWeight: 700, fontSize: 10.5 }}>{it.title}</Text></View>
          {!!period && <Text style={{ color: MUTED, fontSize: 8.5 }}>{period}</Text>}
        </View>
        {!!sub && <Text style={{ color: MUTED, marginTop: 1 }}>{sub}</Text>}
        {!!it.text.trim() && <View style={{ marginTop: 3 }}><Lines text={it.text} rtl={rtl} /></View>}
      </View>
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return <Text>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), rtl)}</Text>
    if (s.kind === 'interests') return <Text>{s.items.map((i) => i.title).filter(Boolean).join('   ·   ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) => (
        <Text key={it.id} style={{ marginTop: 4 }}>
          {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? '   ' : ''}</Text>}
          {fixBidi(it.text, rtl)}
        </Text>
      ))
    return s.items.map(entry)
  }

  return (
    <Document title={fullName(cv)} author={fullName(cv)}>
      <Page size="A4" style={{ ...bodyStyle(lang), paddingTop: 44, paddingBottom: 44, paddingHorizontal: 58 }}>
        <View style={{ flexDirection: row, alignItems: 'flex-end', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 700, fontSize: 28, lineHeight: 1.15 }}>{fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ fontSize: 12, color: accent, marginTop: 5 }}>{personal.title}</Text>}
          </View>
          {!!personal.photo && <Image src={personal.photo} style={{ width: 64, height: 64, borderRadius: 32, objectFit: 'cover' }} />}
        </View>
        {contacts.length > 0 && <View style={{ marginTop: 12 }}><ContactRow items={contacts} rtl={rtl} style={{ color: MUTED, fontSize: 9 }} /></View>}
        {visibleSections(cv).map((s) => (
          <View key={s.id} style={{ marginTop: 18 }}>
            <Text minPresenceAhead={90} style={{ fontWeight: 700, fontSize: 9, color: MUTED, marginBottom: 2, ...(rtl ? {} : { letterSpacing: 1.2 }) }}>
              {rtl ? sectionTitle(s, labels) : sectionTitle(s, labels).toUpperCase()}
            </Text>
            {body(s)}
          </View>
        ))}
      </Page>
    </Document>
  )
}
