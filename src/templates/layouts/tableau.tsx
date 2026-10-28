import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { Lines, SkillLevel, contactList, entryMeta, fixBidi, shade, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'tableau',
  order: 11,
  name: { fr: 'Tableau', en: 'Form', es: 'Formulario', de: 'Formular', it: 'Modulo', pt: 'Formulário', ar: 'استمارة' },
  category: 'classique',
  columns: 1,
  photo: true,
  styles: [
    { name: 'Dossier', variant: 'rules', preset: { accent: '#1d4ed8', fontPair: 'source', photoShape: 'square', skillDisplay: 'text' } },
    { name: 'Registre', variant: 'tinted', preset: { accent: '#374151', fontPair: 'inter', photoShape: 'rounded', skillDisplay: 'dots' } },
    { name: 'Greffe', variant: 'vline', preset: { accent: '#0e7490', fontPair: 'livre', photoShape: 'square', skillDisplay: 'bars' } },
  ],
}

const MUTED = '#5c564d'
const LABEL = 112 // largeur de la colonne des libellés

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
  const tinted = variant === 'tinted'
  const vline = variant === 'vline'
  const contacts = contactList(cv, labels)
  const labBg = tint(t.accent, 0.92)
  const acc = ink(t.accent, tinted ? labBg : '#ffffff')
  const rule = tint(acc, 0.6)

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <View key={it.id} wrap={false} style={{ marginTop: t.m(6) }}>
        <View style={{ flexDirection: t.row, justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ flex: 1, fontWeight: 700 }}>{it.title}</Text>
          {!!period && <Text style={{ color: MUTED }}>{period}</Text>}
        </View>
        {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
        {!!it.text.trim() && <Lines text={it.text} rtl={t.rtl} />}
      </View>
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return <Text style={{ marginTop: 1 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
    if (s.kind === 'interests') return <Text>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it, i) => (
        <View key={it.id} wrap={false} style={{ flexDirection: t.row, justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: i ? t.m(3) : 0 }}>
          <Text style={{ flex: 1 }}>
            {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? ' : ' : ''}</Text>}
            {fixBidi(it.text, t.rtl)}
          </Text>
          <SkillLevel it={it} t={t} color={acc} track={tint(acc, 0.7)} />
        </View>
      ))
    return s.items.map((it, i) => <View key={it.id} style={i === 0 ? { marginTop: -t.m(6) } : {}}>{entry(it)}</View>)
  }

  // Une ligne de « formulaire » : libellé (aligné vers le contenu) | contenu. En RTL, t.row inverse l'ordre et t.end bascule l'alignement.
  const row = (key: string, label: string | null, content: React.ReactNode, first = false) => (
    <View key={key} style={{ flexDirection: t.row, marginTop: first ? 0 : t.m(2), borderTopWidth: 0.6, borderTopColor: rule }}>
      <View style={{ width: LABEL, paddingVertical: t.m(7), paddingHorizontal: t.m(8), ...(tinted ? { backgroundColor: labBg } : {}), ...(vline ? { [t.rtl ? 'borderLeftWidth' : 'borderRightWidth']: 1.2, borderColor: acc } : {}) }}>
        {label !== null && (
          <Text minPresenceAhead={50} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(9.5), color: acc, textAlign: t.end, ...(t.rtl ? {} : { textTransform: 'uppercase' as const, letterSpacing: 0.6 }) }}>
            {label}
          </Text>
        )}
      </View>
      <View style={{ flex: 1, paddingVertical: t.m(7), paddingHorizontal: t.m(12) }}>{content}</View>
    </View>
  )

  return (
    <Document title={fullName(cv)} author={fullName(cv)}>
      <Page {...t.pageProps} style={t.pageStyle(38, 40)}>
        <View style={{ flexDirection: t.row, alignItems: 'center', gap: 16, marginBottom: t.m(10) }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(25), lineHeight: 1.2 }}>{fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ fontSize: t.s(12), color: acc, marginTop: 3 }}>{personal.title}</Text>}
          </View>
          {!!personal.photo && <Image src={personal.photo} style={t.photo(80)} />}
        </View>
        <View style={{ borderTopWidth: 1.6, borderTopColor: acc }}>
          {contacts.length > 0 && row('contact', '', contacts.map((c, i) => <Text key={i} style={{ marginTop: i ? 1.5 : 0 }}>{c}</Text>), true)}
          {visibleSections(cv).map((s) => row(s.id, sectionTitle(s, labels), body(s)))}
        </View>
      </Page>
    </Document>
  )
}
