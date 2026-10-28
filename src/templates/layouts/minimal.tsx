import type { ReactNode } from 'react'
import { Document, Image, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { ContactRow, Entry, SectionFlow, SkillLevel, Text, contactList, entryMeta, fixBidi, ink } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'minimal',
  order: 3,
  name: { fr: 'Minimal', en: 'Minimal', es: 'Minimalista', de: 'Minimal', it: 'Minimale', pt: 'Minimalista', ar: 'بسيط' },
  category: 'simple',
  columns: 1,
  photo: true,
  styles: [
    { name: 'Épuré', variant: 'plain', preset: { accent: '#c2410c', fontPair: 'inter', photoShape: 'circle', skillDisplay: 'text' } },
    { name: 'Gouttière', variant: 'gutter', preset: { accent: '#374151', fontPair: 'source', photoShape: 'square', skillDisplay: 'bars' } },
    { name: 'Filet', variant: 'rule', preset: { accent: '#0e7490', fontPair: 'montserrat', photoShape: 'circle', skillDisplay: 'dots' } },
  ],
}

const MUTED = '#77716a'
const GUTTER = 96 // colonne des titres de section (variante « gouttière »)

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const gutter = variant === 'gutter'
  const rule = variant === 'rule'
  const contacts = contactList(cv, labels)

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <Entry
        key={it.id} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(8) }}
        head={<>
          <View style={{ flexDirection: t.row, justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}><Text style={{ fontWeight: 700, fontSize: t.s(10.5) }}>{it.title}</Text></View>
            {!!period && <Text style={{ color: MUTED, fontSize: t.s(8.5) }}>{period}</Text>}
          </View>
          {!!sub && <Text style={{ color: MUTED, marginTop: 1, marginBottom: 1.5 }}>{sub}</Text>}
        </>}
      />
    )
  }

  const body = (s: Section): ReactNode => {
    if (s.kind === 'profile') return <Text>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
    if (s.kind === 'interests') return <Text>{s.items.map((i) => i.title).filter(Boolean).join('   ·   ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) => (
        <View key={it.id} wrap={false} style={{ flexDirection: t.row, alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: t.m(4) }}>
          <Text style={{ flex: 1 }}>
            {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? '   ' : ''}</Text>}
            {fixBidi(it.text, t.rtl)}
          </Text>
          <SkillLevel it={it} t={t} />
        </View>
      ))
    return s.items.map(entry)
  }

  const label = (s: Section) => {
    const txt = sectionTitle(s, labels)
    return (
      <Text minPresenceAhead={90} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(9), color: rule ? ink(t.accent) : MUTED }}>
        {t.rtl ? txt : txt.toUpperCase()}
      </Text>
    )
  }

  const photo = !!personal.photo && <Image src={personal.photo} style={t.photo(gutter ? 72 : 64)} />

  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={t.pageStyle(44, 58)}>
        {rule && <View style={{ height: 3, width: 48, backgroundColor: t.accent, marginBottom: t.m(10) }} />}
        <View style={{ flexDirection: t.row, alignItems: 'flex-end', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(28), lineHeight: 1.15 }}>{fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ fontSize: t.s(12), color: ink(t.accent), marginTop: 5 }}>{personal.title}</Text>}
          </View>
          {photo}
        </View>
        {contacts.length > 0 && <View style={{ marginTop: t.m(12) }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: MUTED, fontSize: t.s(9) }} /></View>}
        {visibleSections(cv).map((s) =>
          gutter ? (
            // Titre dans la marge de gauche (de droite en RTL), contenu à côté
            <View key={s.id} style={{ marginTop: t.m(16), flexDirection: t.row, gap: 14 }}>
              <View style={{ width: GUTTER }}>{label(s)}</View>
              <View style={{ flex: 1 }}>{body(s)}</View>
            </View>
          ) : (
            <SectionFlow key={s.id} gap={t.m(18)} title={<View style={rule ? { borderBottomWidth: 0.5, borderBottomColor: '#d6d2cb', paddingBottom: 3, marginBottom: 3 } : { marginBottom: 2 }}>{label(s)}</View>}>
              {body(s)}
            </SectionFlow>
          ),
        )}
      </Page>
    </Document>
  )
}
