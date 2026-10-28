import { Document, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { ContactRow, Entry, SectionFlow, SkillLevel, Text, contactList, entryMeta, fixBidi, ink as inkOf } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'executif',
  order: 8,
  name: { fr: 'Exécutif', en: 'Executive', es: 'Ejecutivo', de: 'Executive', it: 'Dirigente', pt: 'Executivo', ar: 'تنفيذي' },
  category: 'classique',
  columns: 1,
  photo: false,
  styles: [
    { name: 'Doublé', variant: 'double', preset: { accent: '#1e3a5f', fontPair: 'playfair', photoShape: 'circle', skillDisplay: 'text' } },
    { name: 'Cadre', variant: 'frame', preset: { accent: '#7f1d1d', fontPair: 'lora', photoShape: 'circle', skillDisplay: 'dots' } },
    { name: 'Étude', variant: 'study', preset: { accent: '#374151', fontPair: 'livre', photoShape: 'circle', skillDisplay: 'bars' } },
  ],
}

const MUTED = '#6b645b'
const RULE = '#9a948a'

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const frame = variant === 'frame'
  const study = variant === 'study'
  const contacts = contactList(cv, labels)
  const ink = inkOf(t.accent) // accent lisible comme texte sur blanc (>= 4,5:1), même très clair

  // Filets doubles fins : deux traits de 0,5 pt espacés de 2 pt
  const double = (style?: { alignSelf?: 'stretch'; marginTop?: number; marginBottom?: number }) => (
    <View style={style}>
      <View style={{ height: 0.5, backgroundColor: RULE }} />
      <View style={{ height: 0.5, backgroundColor: RULE, marginTop: 2 }} />
    </View>
  )

  // Capitales simples, d'un seul tenant : des petites capitales simulées (initiale + reste en deux <Text>) éclatent le nom à l'extraction (C|AMILLE).
  const smallCaps = (txt: string, big: number, small: number) => (
    <Text style={{ fontFamily: t.head, fontWeight: t.rtl ? 700 : 400, fontSize: t.s(t.rtl ? big : (big + small) / 2), textAlign: 'center', lineHeight: 1.5 }}>{t.rtl ? txt : txt.toUpperCase()}</Text>
  )

  const title = (s: Section) => {
    const txt = sectionTitle(s, labels)
    const label = (
      <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(10), color: ink, textAlign: study ? t.start : 'center' }}>
        {t.rtl ? txt : txt.toUpperCase()}
      </Text>
    )
    if (study)
      return <View minPresenceAhead={50}>{label}<View style={{ height: 0.5, backgroundColor: RULE, marginTop: 3 }} /></View>
    if (frame)
      return <View minPresenceAhead={50} style={{ alignItems: 'center' }}>{label}<View style={{ width: 36, height: 1, backgroundColor: t.accent, marginTop: 3 }} /></View>
    return <View minPresenceAhead={50}>{label}{double({ marginTop: 3 })}</View>
  }

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <Entry
        key={it.id} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(7) }}
        head={<>
          <View style={{ flexDirection: t.row, justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ flex: 1, fontWeight: 700 }}>{it.title}</Text>
            {!!period && <Text style={{ color: MUTED, fontSize: t.s(9) }}>{period}</Text>}
          </View>
          {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
        </>}
      />
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return <Text style={{ marginTop: 6 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
    if (s.kind === 'interests') return <Text style={{ marginTop: 6 }}>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) => (
        <View key={it.id} wrap={false} style={{ flexDirection: t.row, justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: t.m(4) }}>
          <Text style={{ flex: 1 }}>
            {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? ' : ' : ''}</Text>}
            {fixBidi(it.text, t.rtl)}
          </Text>
          <SkillLevel it={it} t={t} color={ink} width={52} />
        </View>
      ))
    return s.items.map(entry)
  }

  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={t.pageStyle(46, 52)}>
        <View style={{ alignItems: 'center' }}>
          {(frame || study) && double({ alignSelf: 'stretch', marginBottom: t.m(12) })}
          {smallCaps(fullName(cv), 26, 19)}
          {!!personal.title.trim() && <Text style={{ fontSize: t.s(11), color: ink, marginTop: 8, textAlign: 'center' }}>{personal.title}</Text>}
          {contacts.length > 0 && <View style={{ marginTop: 8 }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: MUTED, fontSize: t.s(9.2) }} center /></View>}
          {double({ alignSelf: 'stretch', marginTop: t.m(12) })}
        </View>
        {visibleSections(cv).map((s) => (
          <SectionFlow key={s.id} gap={t.m(17)} title={title(s)}>{body(s)}</SectionFlow>
        ))}
      </Page>
    </Document>
  )
}
