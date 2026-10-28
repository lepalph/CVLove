import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { ContactRow, Lines, SkillLevel, contactList, entryMeta, fixBidi, onAccent, shade, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'blocs',
  order: 9,
  name: { fr: 'Blocs', en: 'Blocks', es: 'Bloques', de: 'Blöcke', it: 'Blocchi', pt: 'Blocos', ar: 'كتل' },
  category: 'creatif',
  columns: 1,
  photo: true,
  styles: [
    { name: 'Pastel', variant: 'soft', preset: { accent: '#7c3aed', fontPair: 'inter', photoShape: 'circle', skillDisplay: 'dots' } },
    { name: 'Pavé', variant: 'band', preset: { accent: '#0e7490', fontPair: 'montserrat', photoShape: 'rounded', skillDisplay: 'bars' } },
    { name: 'Papier', variant: 'edge', preset: { accent: '#be185d', fontPair: 'source', photoShape: 'circle', skillDisplay: 'text' } },
  ],
}

const MUTED = '#5c564d'

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
  const edge = variant === 'edge'
  const contacts = contactList(cv, labels)

  const block = tint(t.accent, 0.92)
  const accInk = ink(t.accent, block) // lisible sur le bloc teinté (et sur blanc, plus clair)
  const headBg = band ? ink(t.accent, '#ffffff', 7) : undefined
  const headFg = headBg ? onAccent(headBg) : '#1f1b16'

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <View key={it.id} wrap={false} style={{ marginTop: t.m(6) }}>
        <Text style={{ fontWeight: 700 }}>{it.title}</Text>
        {(!!sub || !!period) && <Text style={{ color: MUTED }}>{[period, sub].filter(Boolean).join('  |  ')}</Text>}
        {!!it.text.trim() && <Lines text={it.text} rtl={t.rtl} />}
      </View>
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
          <SkillLevel it={it} t={t} color={accInk} track={tint(accInk, 0.7)} />
        </View>
      ))
    return s.items.map(entry)
  }

  return (
    <Document title={fullName(cv)} author={fullName(cv)}>
      <Page {...t.pageProps} style={t.pageStyle(36, 40)}>
        <View style={{ alignItems: 'center', ...(headBg ? { backgroundColor: headBg, borderRadius: 6, paddingVertical: t.m(16), paddingHorizontal: t.m(16) } : {}) }}>
          {!!personal.photo && <View style={{ marginBottom: 8 }}><Image src={personal.photo} style={t.photo(band ? 84 : 92)} /></View>}
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(band ? 25 : 27), lineHeight: 1.2, textAlign: 'center', color: headFg }}>{fullName(cv)}</Text>
          {!!personal.title.trim() && <Text style={{ fontSize: t.s(12), marginTop: 3, textAlign: 'center', color: headBg ? headFg : accInk }}>{personal.title}</Text>}
          {contacts.length > 0 && (
            <View style={{ marginTop: 8 }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: headBg ? headFg : MUTED, fontSize: t.s(9.5) }} center /></View>
          )}
        </View>
        {visibleSections(cv).map((s) => (
          <View
            key={s.id}
            minPresenceAhead={60}
            style={{
              marginTop: t.m(12), backgroundColor: block, borderRadius: 6, paddingVertical: t.m(10), paddingHorizontal: t.m(14),
              ...(edge ? { borderWidth: 0.6, borderColor: tint(accInk, 0.6), [t.rtl ? 'borderRightWidth' : 'borderLeftWidth']: 3, [t.rtl ? 'borderRightColor' : 'borderLeftColor']: accInk } : {}),
            }}
          >
            <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(12), color: accInk, ...(band && !t.rtl ? { letterSpacing: 1 } : {}) }}>
              {band && !t.rtl ? sectionTitle(s, labels).toUpperCase() : sectionTitle(s, labels)}
            </Text>
            {body(s)}
          </View>
        ))}
      </Page>
    </Document>
  )
}
