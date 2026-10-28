import { Document, Page, Text, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { Lines, SkillLevel, contactList, entryMeta, fixBidi, onAccent, shade, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'grille',
  order: 12,
  name: { fr: 'Grille', en: 'Grid', es: 'Cuadrícula', de: 'Raster', it: 'Griglia', pt: 'Grelha', ar: 'شبكة' },
  category: 'moderne',
  columns: 2,
  photo: false,
  styles: [
    { name: 'Filet', variant: 'rule', preset: { accent: '#1d4ed8', fontPair: 'inter', photoShape: 'circle', skillDisplay: 'dots' } },
    { name: 'Bandeau plein', variant: 'band', preset: { accent: '#0e7490', fontPair: 'montserrat', photoShape: 'circle', skillDisplay: 'bars' } },
    { name: 'Épure', variant: 'plain', preset: { accent: '#7c3aed', fontPair: 'lora', photoShape: 'circle', skillDisplay: 'text' } },
  ],
}

const MUTED = '#5c564d'
const GRID_KINDS = ['education', 'skills', 'languages', 'interests']

// Contraste WCAG local : assombrit l'accent jusqu'à `min`:1 sur le fond donné (accent libre, très clair compris).
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
const ink = (hex: string, bg: string, min = 4.5) => {
  for (let i = 0; i <= 20; i++) { const c = shade(hex, i * 0.05); if (ratio(c, bg) >= min) return c }
  return '#000000'
}

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const band = variant === 'band'
  const plain = variant === 'plain'
  const contacts = contactList(cv, labels)
  const sections = visibleSections(cv)
  const full = sections.filter((s) => !GRID_KINDS.includes(s.kind))
  const grid = GRID_KINDS.map((k) => sections.find((s) => s.kind === k)).filter((s): s is Section => !!s)

  const acc = ink(t.accent, '#ffffff')
  const pillBg = tint(acc, 0.9)
  const headBg = band ? ink(t.accent, '#ffffff', 7) : undefined
  const headFg = headBg ? onAccent(headBg) : '#1f1b16'

  const title = (s: Section) => (
    <Text minPresenceAhead={50} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(11.5), color: acc, paddingBottom: 2, borderBottomWidth: plain ? 0 : 0.8, borderBottomColor: acc, ...(plain && !t.rtl ? { letterSpacing: 1.2 } : {}) }}>
      {plain && !t.rtl ? sectionTitle(s, labels).toUpperCase() : sectionTitle(s, labels)}
    </Text>
  )

  const entry = (it: Item, narrow = false) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <View key={it.id} wrap={false} style={{ marginTop: t.m(6) }}>
        <View style={{ flexDirection: t.row, justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ flex: 1, fontWeight: 700 }}>{it.title}</Text>
          {!!period && !narrow && <Text style={{ color: MUTED }}>{period}</Text>}
        </View>
        {!!period && narrow && <Text style={{ color: MUTED }}>{period}</Text>}
        {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
        {!!it.text.trim() && <Lines text={it.text} rtl={t.rtl} />}
      </View>
    )
  }

  const body = (s: Section, narrow = false) => {
    if (s.kind === 'profile') return <Text style={{ marginTop: 4 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
    if (s.kind === 'interests') return <Text style={{ marginTop: 4 }}>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>
    if (s.kind === 'skills')
      return (
        <View style={{ flexDirection: t.row, flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
          {s.items.map((it) => (
            <View key={it.id} wrap={false} style={{ flexDirection: (it.title + it.text).length > 26 ? 'column' : t.row, alignItems: (it.title + it.text).length > 26 ? 'flex-start' : 'center', gap: 3, backgroundColor: pillBg, borderWidth: 0.5, borderColor: tint(acc, 0.6), borderRadius: 9, maxWidth: '100%', paddingVertical: 2, paddingHorizontal: 7 }}>
              <Text style={{ flexShrink: 1 }}>{it.title}{it.text ? ` : ${it.text}` : ''}</Text>
              <View style={{ flexShrink: 0 }}><SkillLevel it={it} t={t} color={acc} track={tint(acc, 0.7)} width={30} /></View>
            </View>
          ))}
        </View>
      )
    if (s.kind === 'languages')
      return s.items.map((it) => (
        <View key={it.id} wrap={false} style={{ flexDirection: t.row, justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: t.m(3) }}>
          <Text style={{ flex: 1 }}>
            {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? ' : ' : ''}</Text>}
            {fixBidi(it.text, t.rtl)}
          </Text>
          <SkillLevel it={it} t={t} color={acc} track={tint(acc, 0.7)} width={46} />
        </View>
      ))
    return s.items.map((it) => entry(it, narrow))
  }

  const cells = [] as Section[][]
  for (let i = 0; i < grid.length; i += 2) cells.push(grid.slice(i, i + 2))

  const left = (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(26), lineHeight: 1.15, color: headFg }}>{fullName(cv)}</Text>
      {!!personal.title.trim() && <Text style={{ fontSize: t.s(12.5), color: headBg ? headFg : acc, marginTop: 4 }}>{personal.title}</Text>}
    </View>
  )

  return (
    <Document title={fullName(cv)} author={fullName(cv)}>
      <Page {...t.pageProps} style={t.pageStyle(38, 40)}>
        <View
          style={{
            flexDirection: t.row, alignItems: 'flex-end', justifyContent: 'space-between', gap: 20,
            ...(headBg ? { backgroundColor: headBg, borderRadius: 4, padding: t.m(16) } : { paddingBottom: t.m(10), borderBottomWidth: plain ? 0.6 : 2, borderBottomColor: plain ? '#cfcac2' : acc }),
          }}
        >
          {left}
          {contacts.length > 0 && (
            <View style={{ maxWidth: 200 }}>
              {contacts.map((c, i) => <Text key={i} style={{ textAlign: t.end, color: headBg ? headFg : MUTED, fontSize: t.s(9.5), marginTop: i ? 1.5 : 0 }}>{c}</Text>)}
            </View>
          )}
        </View>
        {full.map((s) => (
          <View key={s.id} style={{ marginTop: t.m(16) }}>
            {title(s)}
            {body(s)}
          </View>
        ))}
        {cells.map((pair, r) => (
          <View key={r} style={{ flexDirection: t.row, gap: t.m(24), marginTop: t.m(16) }}>
            {pair.map((s) => (
              <View key={s.id} style={{ flex: 1 }}>
                {title(s)}
                {body(s, true)}
              </View>
            ))}
            {pair.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </Page>
    </Document>
  )
}
