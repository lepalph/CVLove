import { Document, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { colon, ContactRow, Entry, SectionFlow, SkillLevel, Text, contactList, entryMeta, fixBidi, ink as inkOf, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'compact',
  order: 7,
  name: { fr: 'Compact', en: 'Compact', es: 'Compacto', de: 'Kompakt', it: 'Compatto', pt: 'Compacto', ar: 'مضغوط' },
  category: 'simple',
  columns: 2,
  photo: false,
  styles: [
    { name: 'Dense', variant: 'plain', preset: { accent: '#374151', fontPair: 'inter', photoShape: 'circle', skillDisplay: 'text' } },
    { name: 'Repère', variant: 'tick', preset: { accent: '#0e7490', fontPair: 'source', photoShape: 'circle', skillDisplay: 'dots' } },
    { name: 'Fiche', variant: 'strip', preset: { accent: '#c2410c', fontPair: 'livre', photoShape: 'circle', skillDisplay: 'bars' } },
  ],
}

const MUTED = '#6b645b'
const GRID_KINDS = ['skills', 'languages', 'interests', 'projects', 'custom']

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const tick = variant === 'tick'
  const strip = variant === 'strip'
  const sections = visibleSections(cv)
  // flux pleine largeur d'abord (profil, expérience, formation), puis les autres sections en grille de 2 colonnes
  const flow = sections.filter((s) => !GRID_KINDS.includes(s.kind))
  const grid = sections.filter((s) => GRID_KINDS.includes(s.kind))
  const cols = [grid.filter((_, i) => i % 2 === 0), grid.filter((_, i) => i % 2 === 1)]
  const contacts = contactList(cv, labels)
  const ink = inkOf(t.accent) // accent lisible comme texte sur blanc (>= 4,5:1), même très clair
  const fs = t.s(9)

  const title = (s: Section) => {
    const txt = sectionTitle(s, labels)
    const caps = t.rtl ? txt : txt.toUpperCase()
    const base = { fontFamily: t.head, fontWeight: 700 as const, fontSize: t.s(9.5) }
    if (strip)
      return <Text minPresenceAhead={50} style={{ ...base, color: ink, backgroundColor: tint(t.accent, 0.9), paddingHorizontal: 5, paddingVertical: 2 }}>{caps}</Text>
    if (tick)
      return (
        <View minPresenceAhead={50} style={{ flexDirection: t.row, alignItems: 'center', gap: 5 }}>
          <View style={{ width: 3, height: 10, backgroundColor: t.accent }} />
          <Text style={{ ...base, color: '#1f1b16' }}>{caps}</Text>
        </View>
      )
    return <Text minPresenceAhead={50} style={{ ...base, color: ink, paddingBottom: 2, borderBottomWidth: 0.6, borderBottomColor: '#cfcac2' }}>{caps}</Text>
  }

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <Entry
        key={it.id} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(4.5) }}
        head={
          <View style={{ flexDirection: t.row, justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1 }}>
              <Text style={{ fontWeight: 700 }}>{it.title}</Text>
              {!!sub && <Text style={{ color: MUTED }}>{'  ·  '}{sub}</Text>}
            </Text>
            {!!period && <Text style={{ color: MUTED, fontSize: t.s(8.5) }}>{period}</Text>}
          </View>
        }
      />
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return <Text style={{ marginTop: 3 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
    if (s.kind === 'interests') return <Text style={{ marginTop: 3 }}>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) => (
        <View key={it.id} wrap={false} style={{ flexDirection: t.row, justifyContent: 'space-between', alignItems: 'center', gap: 6, marginTop: t.m(2.5) }}>
          <Text style={{ flex: 1 }}>
            {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? colon(cv.lang) : ''}</Text>}
            {fixBidi(it.text, t.rtl)}
          </Text>
          <SkillLevel it={it} t={t} color={ink} width={42} />
        </View>
      ))
    return s.items.map(entry)
  }

  // Colonne de la grille : un bloc court ne se coupe pas (titre jamais seul en bas de colonne) ; un bloc long peut passer à la page suivante.
  const block = (s: Section, first: boolean) => (
    <View key={s.id} wrap={s.items.reduce((n, i) => n + i.text.length, 0) > 700} style={{ marginTop: t.m(first ? 0 : 9) }}>{title(s)}{body(s)}</View>
  )

  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={{ ...t.pageStyle(28, 34), fontSize: fs }}>
        <Text style={{ lineHeight: 1.3 }}>
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(19) }}>{fullName(cv)}</Text>
          {!!personal.title.trim() && <Text style={{ fontSize: t.s(11), color: ink }}>{'   '}{personal.title}</Text>}
        </Text>
        {contacts.length > 0 && (
          <View style={{ marginTop: 4, paddingBottom: 5, borderBottomWidth: tick ? 1.5 : 0.8, borderBottomColor: tick ? t.accent : '#cfcac2' }}>
            <ContactRow items={contacts} rtl={t.rtl} style={{ color: MUTED, fontSize: t.s(8.8) }} />
          </View>
        )}
        {flow.map((s) => <SectionFlow key={s.id} gap={t.m(9)} title={title(s)}>{body(s)}</SectionFlow>)}
        {grid.length > 0 && (
          <View style={{ flexDirection: t.row, gap: 22, marginTop: t.m(9) }}>
            {cols.map((c, i) => <View key={i} style={{ flex: 1 }}>{c.map((s, j) => block(s, j === 0))}</View>)}
          </View>
        )}
      </Page>
    </Document>
  )
}
