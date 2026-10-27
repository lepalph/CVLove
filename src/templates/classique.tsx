import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import { sectionTitle } from '../i18n/labels'
import { fullName, visibleFields, visibleSections } from '../model/cv'
import { formatDay, formatPeriod, isRtl } from '../model/dates'
import type { Item, Section } from '../model/types'
import { bodyStyle, fontFor } from '../pdf/fonts'
import { Lines, fixBidi } from './shared'
import type { TemplateProps } from './types'

const MUTED = '#6b645b'

export function Component({ cv, labels }: TemplateProps) {
  const { lang, accent, personal } = cv
  const serif = fontFor(lang, 'serif')
  // yoga n'hérite pas `direction` pour les rangées : on inverse à la main en RTL (voir bodyStyle)
  const row = isRtl(lang) ? 'row-reverse' : 'row'
  const contacts = visibleFields(cv).map((f) =>
    f.kind === 'birthDate' ? `${labels.born} ${formatDay(f.value, lang)}`
    : f.kind === 'custom' && f.label?.trim() ? `${f.label.trim()} : ${f.value}`
    : f.value,
  )

  const entry = (s: Section, it: Item) => {
    const period = formatPeriod(it, lang, labels.present)
    const sub = [it.subtitle, it.place].filter((x) => x.trim()).join(' · ')
    return (
      <View key={it.id} wrap={false} style={{ marginTop: 6 }}>
        <View style={{ flexDirection: row, justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ flex: 1, fontWeight: 700 }}>{it.title}</Text>
          {!!period && <Text style={{ color: MUTED }}>{period}</Text>}
        </View>
        {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
        {!!it.text.trim() && <Lines text={it.text} rtl={isRtl(lang)} />}
      </View>
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return <Text style={{ marginTop: 4 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), isRtl(lang))}</Text>
    if (s.kind === 'interests') return <Text style={{ marginTop: 4 }}>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) => (
        <Text key={it.id} style={{ marginTop: 3 }}>
          {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? ' : ' : ''}</Text>}
          {it.text}
        </Text>
      ))
    return s.items.map((it) => entry(s, it))
  }

  return (
    <Document title={fullName(cv)} author={fullName(cv)}>
      <Page size="A4" style={{ ...bodyStyle(lang), paddingVertical: 40, paddingHorizontal: 44 }}>
        <View style={{ flexDirection: row, alignItems: 'center', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 25, lineHeight: 1.2 }}>{fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ fontSize: 12, color: accent, marginTop: 3 }}>{personal.title}</Text>}
            {contacts.length > 0 && <Text style={{ marginTop: 8, color: MUTED }}>{contacts.join('   ·   ')}</Text>}
          </View>
          {!!personal.photo && <Image src={personal.photo} style={{ width: 78, height: 78, borderRadius: 39, objectFit: 'cover' }} />}
        </View>
        {visibleSections(cv).map((s) => (
          <View key={s.id} style={{ marginTop: 16 }}>
            <Text
              minPresenceAhead={50}
              style={{ fontFamily: serif, fontWeight: 700, fontSize: 12.5, color: accent, paddingBottom: 3, borderBottomWidth: 0.8, borderBottomColor: accent }}
            >
              {sectionTitle(s, labels)}
            </Text>
            {body(s)}
          </View>
        ))}
      </Page>
    </Document>
  )
}
