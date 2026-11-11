import type { ReactNode } from 'react'
import { Document, Image, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { colon, ContactRow, Entry, SkillLevel, Text, contactList, entryMeta, fixBidi, ink, tint } from '../shared'
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

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const band = variant === 'band'
  const edge = variant === 'edge'
  const contacts = contactList(cv, labels)

  const block = tint(t.accent, 0.92)
  const accInk = ink(t.accent, block) // lisible sur le bloc teinté (et sur blanc, plus clair)
  const headBg = band ? ink(t.accent, '#ffffff', 7) : undefined
  const headFg = headBg ? '#ffffff' : '#1f1b16'

  const entry = (it: Item, lead?: ReactNode) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <Entry
        key={it.id} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(6) }}
        head={<>
          {lead}
          <Text style={{ fontWeight: 700 }}>{it.title}</Text>
          {(!!sub || !!period) && <Text style={{ color: MUTED }}>{[period, sub].filter(Boolean).join('  |  ')}</Text>}
        </>}
      />
    )
  }

  const body = (s: Section, lead?: ReactNode) => {
    if (s.kind === 'profile') return <Text style={{ marginTop: 4 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
    if (s.kind === 'interests') return <Text style={{ marginTop: 4 }}>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) => (
        <View key={it.id} wrap={false} style={{ flexDirection: t.row, justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: t.m(3) }}>
          <Text style={{ flex: 1 }}>
            {it.title && <Text style={{ fontWeight: 700 }}>{it.title}{it.text ? colon(cv.lang) : ''}</Text>}
            {fixBidi(it.text, t.rtl)}
          </Text>
          <SkillLevel it={it} t={t} color={accInk} track={tint(accInk, 0.7)} />
        </View>
      ))
    return s.items.map((it, i) => entry(it, i ? undefined : lead))
  }

  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={{ ...t.pageStyle(36, 40), paddingBottom: t.m(24) }}>
        <View style={{ alignItems: 'center', ...(headBg ? { backgroundColor: headBg, borderRadius: 6, paddingVertical: t.m(11), paddingHorizontal: t.m(16) } : {}) }}>
          {!!personal.photo && <View style={{ marginBottom: 8 }}><Image src={personal.photo} style={t.photo(band ? 84 : 92)} /></View>}
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(band ? 25 : 27), lineHeight: 1.2, textAlign: 'center', color: headFg }}>{fullName(cv)}</Text>
          {!!personal.title.trim() && <Text style={{ fontSize: t.s(12), marginTop: 3, textAlign: 'center', color: headBg ? headFg : accInk }}>{personal.title}</Text>}
          {contacts.length > 0 && (
            <View style={{ marginTop: 8 }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: headBg ? headFg : MUTED, fontSize: t.s(9.5) }} center /></View>
          )}
        </View>
        {visibleSections(cv).map((s) => {
          // Bloc court : insécable. Bloc d'entrées long : peut passer à la page suivante, titre porté par la 1re entrée (jamais seul en bas de page).
          const split = ['experience', 'education', 'projects', 'volunteering', 'custom'].includes(s.kind) && s.items.reduce((n, i) => n + i.text.length, 0) > 500
          const title = (
            <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(12), color: accInk }}>
              {sectionTitle(s, labels)}
            </Text>
          )
          return (
            <View
              key={s.id}
              wrap={split}
              style={{
                marginTop: t.m(7), backgroundColor: block, borderRadius: 6, paddingVertical: t.m(7), paddingHorizontal: t.m(14),
                ...(edge ? { borderWidth: 0.6, borderColor: tint(accInk, 0.6), [t.rtl ? 'borderRightWidth' : 'borderLeftWidth']: 3, [t.rtl ? 'borderRightColor' : 'borderLeftColor']: accInk } : {}),
              }}
            >
              {!split && title}
              {body(s, split ? title : undefined)}
            </View>
          )
        })}
      </Page>
    </Document>
  )
}
