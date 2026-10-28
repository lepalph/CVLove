import { Document, Image, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { ContactRow, Entry, Lines, SectionFlow, SkillLevel, Text, contactList, entryMeta, fixBidi, ink as inkOf, lineNodes, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'chronologie',
  order: 5,
  name: { fr: 'Chronologie', en: 'Timeline', es: 'Cronología', de: 'Zeitleiste', it: 'Cronologia', pt: 'Cronologia', ar: 'الخط الزمني' },
  category: 'moderne',
  columns: 1,
  photo: true,
  styles: [
    { name: 'Frise', variant: 'line', preset: { accent: '#0e7490', fontPair: 'inter', photoShape: 'circle', skillDisplay: 'bars' } },
    { name: 'Jalons', variant: 'ring', preset: { accent: '#7c3aed', fontPair: 'montserrat', photoShape: 'rounded', skillDisplay: 'dots' } },
    { name: 'Repères', variant: 'tag', preset: { accent: '#1d4ed8', fontPair: 'source', photoShape: 'circle', skillDisplay: 'text' } },
  ],
}

const MUTED = '#6b645b'
const DATE_W = 100 // colonne des dates, à gauche de la frise
const RAIL_W = 16 // colonne de la frise
const TIMELINE = ['experience', 'education']

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const ring = variant === 'ring'
  const tag = variant === 'tag'
  const contacts = contactList(cv, labels)
  const ink = inkOf(t.accent) // accent utilisable comme texte sur blanc (>= 4,5:1), même s'il est très clair
  const chipBg = tint(t.accent, 0.88)
  const chipInk = inkOf(t.accent, chipBg) // lisible sur la pastille teintée

  const title = (s: Section) => (
    <View minPresenceAhead={60} style={{ flexDirection: t.row, alignItems: 'center', gap: 8, marginBottom: 2 }}>
      <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(11.5), color: ink }}>
        {t.rtl ? sectionTitle(s, labels) : sectionTitle(s, labels).toUpperCase()}
      </Text>
      <View style={{ flex: 1, height: 0.6, backgroundColor: tint(t.accent, 0.55) }} />
    </View>
  )

  const dot = ring
    ? { width: 9, height: 9, borderRadius: 4.5, borderWidth: 2, borderColor: t.accent, backgroundColor: '#ffffff' }
    : { width: 9, height: 9, borderRadius: 4.5, backgroundColor: t.accent }

  const timelineItem = (it: Item, i: number, n: number) => {
    const { period, sub } = entryMeta(it, cv, labels)
    const [first, ...rest] = lineNodes(it.text, t.rtl)
    const rail = (top: number) => i < n - 1 && <View style={{ position: 'absolute', top, bottom: 0, width: 1, backgroundColor: tint(t.accent, 0.45) }} />
    return (
      <View key={it.id}>
        <View wrap={false} style={{ flexDirection: t.row }}>
          <View style={{ width: DATE_W, paddingTop: 1 }}>
            {!!period && (
              tag
                ? <Text style={{ alignSelf: t.rtl ? 'flex-start' : 'flex-end', backgroundColor: chipBg, color: chipInk, fontSize: t.s(8.5), paddingHorizontal: 4, paddingVertical: 1.5, borderRadius: 2, textAlign: 'center' }}>{period}</Text>
                : <Text style={{ color: MUTED, fontSize: t.s(8.5), textAlign: t.end }}>{period}</Text>
            )}
          </View>
          <View style={{ width: RAIL_W, alignItems: 'center' }}>
            {rail(5)}
            <View style={{ marginTop: 2.5, ...dot }} />
          </View>
          <View style={{ flex: 1, paddingBottom: rest.length ? 0 : t.m(9) }}>
            <Text style={{ fontWeight: 700, fontSize: t.s(10.5) }}>{it.title}</Text>
            {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
            {first}
          </View>
        </View>
        {rest.length > 0 && (
          // suite de la description : peut changer de page, la frise continue à côté
          <View style={{ flexDirection: t.row }}>
            <View style={{ width: DATE_W }} />
            <View style={{ width: RAIL_W, alignItems: 'center' }}>{rail(0)}</View>
            <View style={{ flex: 1, paddingBottom: t.m(9) }}>{rest}</View>
          </View>
        )}
      </View>
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return <Text style={{ marginTop: 4 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
    if (s.kind === 'interests') return <Text style={{ marginTop: 4 }}>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return (
        <View style={{ flexDirection: t.row, flexWrap: 'wrap', columnGap: 20 }}>
          {s.items.map((it) => (
            <View key={it.id} wrap={false} style={{ width: '47%', flexDirection: t.row, justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: t.m(4) }}>
              <Text style={{ flex: 1 }}>
                {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? ' : ' : ''}</Text>}
                {fixBidi(it.text, t.rtl)}
              </Text>
              <SkillLevel it={it} t={t} color={ink} width={50} />
            </View>
          ))}
        </View>
      )
    if (TIMELINE.includes(s.kind)) return <View style={{ marginTop: t.m(8) }}>{s.items.map((it, i) => timelineItem(it, i, s.items.length))}</View>
    // projets et sections libres : même alignement que la frise, sans la frise ; sans date, pleine largeur
    return s.items.map((it) => {
      const { period, sub } = entryMeta(it, cv, labels)
      const head = (
        <>
          <Text style={{ fontWeight: 700 }}>{it.title}</Text>
          {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
        </>
      )
      if (!period) return <Entry key={it.id} head={head} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(6) }} />
      return (
        <View key={it.id} wrap={false} style={{ flexDirection: t.row, marginTop: t.m(6) }}>
          <Text style={{ width: DATE_W, color: MUTED, fontSize: t.s(8.5), textAlign: t.end }}>{period}</Text>
          <View style={{ width: RAIL_W }} />
          <View style={{ flex: 1 }}>
            {head}
            {!!it.text.trim() && <Lines text={it.text} rtl={t.rtl} />}
          </View>
        </View>
      )
    })
  }

  const photo = !!personal.photo && <Image src={personal.photo} style={t.photo(76)} />
  const head = (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(26), lineHeight: 1.15 }}>{fullName(cv)}</Text>
      {!!personal.title.trim() && <Text style={{ fontSize: t.s(12.5), color: ink, marginTop: 3 }}>{personal.title}</Text>}
      {contacts.length > 0 && <View style={{ marginTop: 7 }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: MUTED, fontSize: t.s(9.2) }} /></View>}
    </View>
  )

  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={t.pageStyle(40, 44)}>
        <View style={{ flexDirection: t.row, alignItems: 'center', gap: 16, paddingBottom: t.m(12), borderBottomWidth: 1.5, borderBottomColor: t.accent }}>
          {head}
          {photo}
        </View>
        {visibleSections(cv).map((s) => (
          <SectionFlow key={s.id} gap={t.m(15)} title={title(s)}>{body(s)}</SectionFlow>
        ))}
      </Page>
    </Document>
  )
}
