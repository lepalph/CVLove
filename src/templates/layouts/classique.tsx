import { Document, Image, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { ContactRow, Entry, SectionFlow, SkillLevel, Text, contactList, entryMeta, fixBidi, ink } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'classique',
  order: 1,
  name: { fr: 'Classique', en: 'Classic', es: 'Clásico', de: 'Klassisch', it: 'Classico', pt: 'Clássico', ar: 'كلاسيكي' },
  category: 'classique',
  columns: 1,
  photo: true,
  styles: [
    { name: 'Académique', variant: 'academic', preset: { accent: '#c2410c', fontPair: 'lora', photoShape: 'circle', skillDisplay: 'text' } },
    { name: 'Chancellerie', variant: 'centered', preset: { accent: '#1d4ed8', fontPair: 'source', photoShape: 'circle', skillDisplay: 'dots' } },
    { name: 'Gazette', variant: 'editorial', preset: { accent: '#047857', fontPair: 'playfair', photoShape: 'rounded', skillDisplay: 'bars' } },
  ],
}

const MUTED = '#6b645b'

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const centered = variant === 'centered'
  const editorial = variant === 'editorial'
  const contacts = contactList(cv, labels)
  const acc = ink(t.accent) // accent lisible comme texte sur blanc, même très clair

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <Entry
        key={it.id} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(6) }}
        head={<>
          <View style={{ flexDirection: t.row, justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, fontWeight: 700 }}>{it.title}</Text>
            {!!period && <Text style={{ color: MUTED }}>{period}</Text>}
          </View>
          {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
        </>}
      />
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return <Text style={{ marginTop: 4 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
    if (s.kind === 'interests') return <Text style={{ marginTop: 4 }}>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) => (
        <View key={it.id} wrap={false} style={{ flexDirection: t.row, justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: t.m(3) }}>
          <Text style={{ flex: 1 }}>
            {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? ' : ' : ''}</Text>}
            {fixBidi(it.text, t.rtl)}
          </Text>
          <SkillLevel it={it} t={t} />
        </View>
      ))
    return s.items.map(entry)
  }

  const title = (s: Section) => {
    const txt = sectionTitle(s, labels)
    if (centered)
      return (
        <Text minPresenceAhead={50} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(10.5), color: acc, paddingBottom: 3, borderBottomWidth: 0.5, borderBottomColor: '#cfcac2' }}>
          {t.rtl ? txt : txt.toUpperCase()}
        </Text>
      )
    if (editorial)
      return (
        <View minPresenceAhead={50} style={{ flexDirection: t.row, alignItems: 'center', gap: 6 }}>
          <View style={{ width: 7, height: 7, backgroundColor: t.accent }} />
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(13), color: '#1f1b16' }}>{txt}</Text>
        </View>
      )
    return (
      <Text minPresenceAhead={50} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(12.5), color: acc, paddingBottom: 3, borderBottomWidth: 0.8, borderBottomColor: acc }}>
        {txt}
      </Text>
    )
  }

  const photo = !!personal.photo && <Image src={personal.photo} style={t.photo(centered ? 70 : editorial ? 84 : 78)} />
  const name = (
    <>
      <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(editorial ? 30 : centered ? 27 : 25), lineHeight: 1.2, ...(centered ? { textAlign: 'center' } : {}) }}>{fullName(cv)}</Text>
      {!!personal.title.trim() && (
        <Text style={{ fontSize: t.s(12), color: acc, marginTop: 3, ...(centered ? { textAlign: 'center' } : {}) }}>{personal.title}</Text>
      )}
    </>
  )

  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={t.pageStyle(40, 44)}>
        {editorial && <View style={{ height: 4, backgroundColor: t.accent, marginBottom: t.m(14) }} />}
        {centered ? (
          <View style={{ alignItems: 'center' }}>
            {photo && <View style={{ marginBottom: 8 }}>{photo}</View>}
            {name}
            {contacts.length > 0 && <View style={{ marginTop: 8 }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: MUTED, fontSize: t.s(9.5) }} center /></View>}
          </View>
        ) : (
          <>
            <View style={{ flexDirection: t.row, alignItems: 'center', gap: 16 }}>
              <View style={{ flex: 1 }}>{name}</View>
              {photo}
            </View>
            {contacts.length > 0 && (
              editorial
                ? <View style={{ marginTop: t.m(10), paddingVertical: 5, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#cfcac2' }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: MUTED, fontSize: t.s(9.5) }} /></View>
                : <View style={{ marginTop: 8 }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: MUTED, fontSize: t.s(9.5) }} /></View>
            )}
          </>
        )}
        {visibleSections(cv).map((s) => (
          <SectionFlow key={s.id} gap={t.m(16)} title={title(s)}>{body(s)}</SectionFlow>
        ))}
      </Page>
    </Document>
  )
}
