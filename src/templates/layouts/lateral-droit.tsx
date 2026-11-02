import { Document, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { Entry, SkillLevel, Text, contactList, entryMeta, fixBidi, ink as inkOf, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'lateral-droit',
  order: 6,
  name: { fr: 'Marge latérale', en: 'Side column', es: 'Columna lateral', de: 'Seitenspalte', it: 'Colonna laterale', pt: 'Coluna lateral', ar: 'عمود جانبي' },
  category: 'moderne',
  columns: 2,
  apart: ['skills', 'languages', 'interests'],
  photo: false,
  styles: [
    { name: 'Filet', variant: 'rule', preset: { accent: '#374151', fontPair: 'source', photoShape: 'circle', skillDisplay: 'text' } },
    { name: 'Capitales', variant: 'caps', preset: { accent: '#be185d', fontPair: 'inter', photoShape: 'circle', skillDisplay: 'dots' } },
    { name: 'Marginalia', variant: 'serif', preset: { accent: '#047857', fontPair: 'lora', photoShape: 'circle', skillDisplay: 'bars' } },
  ],
}

const MUTED = '#6b645b'
const COL = 150 // colonne étroite
const GAP = 24 // espace de part et d'autre du filet

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const caps = variant === 'caps'
  const serif = variant === 'serif'
  const sections = visibleSections(cv)
  const mainSections = sections.filter((s) => !meta.apart!.includes(s.kind))
  const sideSections = sections.filter((s) => meta.apart!.includes(s.kind)) // dans l'ordre choisi dans l'éditeur
  const contacts = contactList(cv, labels)
  const ink = inkOf(t.accent) // accent lisible comme texte sur blanc (>= 4,5:1), même très clair

  const spaced = (s: string) => (t.rtl ? s : s.toUpperCase())

  const mainTitle = (s: Section) => (
    <Text minPresenceAhead={60} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(caps ? 9.5 : 12), color: ink, marginBottom: 2 }}>
      {caps ? spaced(sectionTitle(s, labels)) : sectionTitle(s, labels)}
    </Text>
  )
  const sideTitle = (s: Section) => (
    <Text minPresenceAhead={60} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(9), color: ink, marginBottom: 2 }}>
      {spaced(sectionTitle(s, labels))}
    </Text>
  )

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <Entry
        key={it.id} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(8) }}
        head={<>
          <View style={{ flexDirection: t.row, justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, fontWeight: 700, fontSize: t.s(10.5) }}>{it.title}</Text>
            {!!period && <Text style={{ color: MUTED, fontSize: t.s(8.8) }}>{period}</Text>}
          </View>
          {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
        </>}
      />
    )
  }

  const mainBody = (s: Section) =>
    s.kind === 'profile'
      ? <Text style={{ marginTop: 4 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
      : s.items.map(entry)

  const sideBody = (s: Section) =>
    s.kind === 'interests'
      ? s.items.filter((i) => i.title.trim()).map((i) => <Text key={i.id} style={{ marginTop: 2 }}>{i.title}</Text>)
      : s.items.map((it) => (
          <View key={it.id} wrap={false} style={{ marginTop: t.m(4) }}>
            <Text style={{ fontWeight: 700 }}>{it.title}</Text>
            {!!it.text.trim() && <Text>{fixBidi(it.text, t.rtl)}</Text>}
            <View style={{ marginTop: 2 }}><SkillLevel it={it} t={t} color={ink} track={tint(t.accent, 0.7)} width={COL - 50} /></View>
          </View>
        ))

  const padH = t.m(40)
  const padV = t.m(40)
  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={t.pageStyle(40, 40)}>
        {/* Filet de séparation répété sur chaque page ; la colonne étroite est du côté de fin (droite en LTR, gauche en RTL) */}
        <View fixed style={{ position: 'absolute', top: padV, bottom: padV, [t.end]: padH + COL + GAP, width: 0.8, backgroundColor: tint(t.accent, 0.4) }} />
        <View style={{ flexDirection: t.row, gap: GAP * 2 + 0.8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(caps ? 22 : 26), lineHeight: 1.15 }}>{caps ? spaced(fullName(cv)) : fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ fontSize: t.s(12), color: ink, marginTop: 4 }}>{personal.title}</Text>}
            {mainSections.map((s) => (
              <View key={s.id} style={{ marginTop: t.m(serif ? 16 : 14) }}>
                {mainTitle(s)}
                {mainBody(s)}
              </View>
            ))}
          </View>
          <View style={{ width: COL, paddingTop: 3 }}>
            {contacts.map((c, i) => <Text key={i} style={{ marginTop: i ? 3 : 0, color: '#3d382f' }}>{c}</Text>)}
            {sideSections.map((s) => (
              <View key={s.id} style={{ marginTop: t.m(15) }}>
                {sideTitle(s)}
                {sideBody(s)}
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}
