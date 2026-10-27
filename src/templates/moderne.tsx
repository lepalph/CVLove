import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import { sectionTitle } from '../i18n/labels'
import { fullName, visibleSections } from '../model/cv'
import { formatPeriod, isRtl } from '../model/dates'
import type { Item, Section } from '../model/types'
import { bodyStyle, fontFor } from '../pdf/fonts'
import { Lines, contactList, fixBidi, tint } from './shared'
import type { TemplateProps } from './types'

const MUTED = '#6b645b'
const SIDE = 188 // largeur du bandeau latéral
const MAIN_KINDS = ['profile', 'experience', 'education', 'projects', 'custom']

export function Component({ cv, labels }: TemplateProps) {
  const { lang, accent, personal } = cv
  const rtl = isRtl(lang)
  const sans = fontFor(lang, 'sans')
  const side = rtl ? 'right' : 'left'
  const sections = visibleSections(cv)
  const mainSections = sections.filter((s) => MAIN_KINDS.includes(s.kind))
  const sideSections = sections.filter((s) => !MAIN_KINDS.includes(s.kind) && s.kind !== 'interests')
  const interests = sections.filter((s) => s.kind === 'interests')
  const contacts = contactList(cv, labels)
  const row = rtl ? 'row-reverse' : 'row'

  const h = (s: Section, color: string) => (
    <Text minPresenceAhead={90} style={{ fontWeight: 700, fontSize: 11.5, color, marginBottom: 3 }}>{sectionTitle(s, labels)}</Text>
  )

  const entry = (it: Item) => {
    const period = formatPeriod(it, lang, labels.present)
    const sub = [it.subtitle, it.place].filter((x) => x.trim()).join(' · ')
    return (
      <View key={it.id} wrap={false} style={{ marginTop: 7 }}>
        <Text style={{ fontWeight: 700, fontSize: 10.5 }}>{it.title}</Text>
        {(!!sub || !!period) && (
          <Text style={{ color: MUTED }}>{[sub, period].filter(Boolean).join('  |  ')}</Text>
        )}
        {!!it.text.trim() && <Lines text={it.text} rtl={rtl} />}
      </View>
    )
  }

  const mainBody = (s: Section) =>
    s.kind === 'profile'
      ? <Text style={{ marginTop: 5 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), rtl)}</Text>
      : s.items.map(entry)

  const sideBody = (s: Section) =>
    s.items.map((it) => (
      <View key={it.id} wrap={false} style={{ marginTop: 4 }}>
        <Text style={{ fontWeight: 700 }}>{it.title}</Text>
        {!!it.text.trim() && <Text style={{ color: '#3d382f' }}>{fixBidi(it.text, rtl)}</Text>}
      </View>
    ))

  return (
    <Document title={fullName(cv)} author={fullName(cv)}>
      <Page
        size="A4"
        style={{ ...bodyStyle(lang), paddingVertical: 38, [rtl ? 'paddingRight' : 'paddingLeft']: SIDE + 28, [rtl ? 'paddingLeft' : 'paddingRight']: 34 }}
      >
        {/* Fond du bandeau : répété sur chaque page ; son contenu n'est que sur la page 1 */}
        <View fixed style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: SIDE, backgroundColor: tint(accent, 0.9) }} />
        <View style={{ position: 'absolute', top: 38, [side]: 0, width: SIDE, paddingHorizontal: 20 }}>
          {!!personal.photo && (
            <Image src={personal.photo} style={{ width: 100, height: 100, borderRadius: 50, objectFit: 'cover', alignSelf: 'center', marginBottom: 16 }} />
          )}
          {contacts.length > 0 && (
            <View>{contacts.map((c, i) => <Text key={i} style={{ marginTop: 3, color: '#3d382f' }}>{c}</Text>)}</View>
          )}
          {[...sideSections, ...interests].map((s) => (
            <View key={s.id} style={{ marginTop: 16 }}>
              {h(s, accent)}
              {s.kind === 'interests'
                ? s.items.filter((i) => i.title.trim()).map((i) => <Text key={i.id} style={{ marginTop: 2 }}>{i.title}</Text>)
                : sideBody(s)}
            </View>
          ))}
        </View>

        <View style={{ flexDirection: row, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, lineHeight: 1.15 }}>{fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ fontSize: 12.5, color: accent, marginTop: 4 }}>{personal.title}</Text>}
          </View>
        </View>
        {mainSections.map((s) => (
          <View key={s.id} style={{ marginTop: 18 }}>
            <View style={{ borderBottomWidth: 0.8, borderBottomColor: accent, marginBottom: 2 }}>{h(s, accent)}</View>
            {mainBody(s)}
          </View>
        ))}
      </Page>
    </Document>
  )
}
