import type { ReactNode } from 'react'
import { Document, Image, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { ContactRow, SectionFlow, SkillLevel, Text, contactList, entryMeta, fixBidi, ink, lineNodes, shade, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'creatif',
  order: 4,
  name: { fr: 'Créatif', en: 'Creative', es: 'Creativo', de: 'Kreativ', it: 'Creativo', pt: 'Criativo', ar: 'إبداعي' },
  category: 'creatif',
  columns: 1,
  photo: true,
  styles: [
    { name: 'Aplat', variant: 'solid', preset: { accent: '#c2410c', fontPair: 'inter', photoShape: 'rounded', skillDisplay: 'text' } },
    { name: 'Pastel', variant: 'soft', preset: { accent: '#7c3aed', fontPair: 'playfair', photoShape: 'circle', skillDisplay: 'dots' } },
    { name: 'Étiquette', variant: 'tags', preset: { accent: '#be185d', fontPair: 'montserrat', photoShape: 'square', skillDisplay: 'bars' } },
  ],
}

const MUTED = '#6b645b'
const META = 104 // colonne étroite de dates / métadonnées

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const soft = variant === 'soft'
  const tags = variant === 'tags'
  const contacts = contactList(cv, labels)
  const padV = t.m(38)
  const padH = t.m(44)

  const acc = ink(t.accent) // texte d'accent sur blanc >= 4,5:1
  const deep = ink(t.accent, '#ffffff', 7) // aplat qui porte du texte blanc >= 7:1
  const bg = soft ? tint(t.accent, 0.88) : tags ? ink(shade(t.accent, 0.55), '#ffffff', 7) : deep
  const fg = soft ? '#1f1b16' : '#ffffff'
  const sub = soft ? ink(t.accent, bg) : fg

  // Rangée « métadonnées | contenu » : largeur fixe à gauche (à droite en RTL), le contenu dans une View flex:1.
  // `rest` : lignes de description au-delà de la première, sous le contenu et qui peuvent changer de page.
  const line = (key: string, meta: ReactNode, content: ReactNode, top = 6, rest: ReactNode[] = []) => (
    <View key={key} style={{ marginTop: t.m(top) }}>
      <View wrap={false} style={{ flexDirection: t.row, gap: 14 }}>
        <View style={{ width: META }}>{meta}</View>
        <View style={{ flex: 1 }}>{content}</View>
      </View>
      {rest.length > 0 && <View style={{ [t.rtl ? 'paddingRight' : 'paddingLeft']: META + 14 }}>{rest}</View>}
    </View>
  )

  const entry = (it: Item) => {
    const { period } = entryMeta(it, cv, labels)
    const [first, ...rest] = lineNodes(it.text, t.rtl)
    return line(
      it.id,
      <>
        {!!period && <Text style={{ color: acc, fontSize: t.s(8.5) }}>{period}</Text>}
        {!!it.place.trim() && <Text style={{ color: MUTED, fontSize: t.s(8.5), marginTop: 1 }}>{it.place}</Text>}
      </>,
      <>
        <Text style={{ fontWeight: 700, fontSize: t.s(10.5) }}>{it.title}</Text>
        {!!it.subtitle.trim() && <Text style={{ color: MUTED }}>{it.subtitle}</Text>}
        {first}
      </>,
      6,
      rest,
    )
  }

  const body = (s: Section) => {
    if (s.kind === 'profile') return line(s.id, null, <Text>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>)
    if (s.kind === 'interests') return line(s.id, null, <Text>{s.items.map((i) => i.title).filter(Boolean).join('  ·  ')}</Text>)
    if (s.kind === 'skills' || s.kind === 'languages')
      return s.items.map((it) =>
        line(it.id, <Text style={{ fontWeight: 700 }}>{it.title}</Text>, <><Text>{fixBidi(it.text, t.rtl)}</Text><SkillLevel it={it} t={t} /></>, 5),
      )
    return s.items.map(entry)
  }

  const title = (s: Section) => {
    const txt = sectionTitle(s, labels)
    if (tags)
      return (
        <View minPresenceAhead={90} style={{ alignSelf: 'flex-start', backgroundColor: deep, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 2 }}>
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(10.5), color: '#ffffff' }}>{txt}</Text>
        </View>
      )
    return (
      <View minPresenceAhead={90} style={{ flexDirection: t.row, alignItems: 'center', gap: 8 }}>
        <View style={{ width: 16, height: 4, backgroundColor: t.accent }} />
        <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(12), color: acc }}>{txt}</Text>
      </View>
    )
  }

  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={t.pageStyle(38, 44)}>
        {/* En-tête en aplat plein format : marges négatives pour ne pas dépendre du padding (la page 2 garde le sien) */}
        <View
          style={{
            marginTop: -padV, marginHorizontal: -padH, paddingVertical: t.m(28), paddingHorizontal: padH,
            backgroundColor: bg, flexDirection: t.row, alignItems: 'center', gap: 20,
            ...(soft ? { borderBottomWidth: 3, borderBottomColor: t.accent } : {}),
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: fg, fontFamily: t.head, fontWeight: 700, fontSize: t.s(34), lineHeight: 1.1 }}>{fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ color: sub, fontSize: t.s(13), marginTop: 6 }}>{personal.title}</Text>}
            {contacts.length > 0 && <View style={{ marginTop: 12 }}><ContactRow items={contacts} rtl={t.rtl} style={{ color: fg, fontSize: t.s(9) }} /></View>}
          </View>
          {!!personal.photo && <Image src={personal.photo} style={t.photo(92)} />}
        </View>
        {visibleSections(cv).map((s) => (
          <SectionFlow key={s.id} gap={t.m(13)} title={title(s)}>{body(s)}</SectionFlow>
        ))}
      </Page>
    </Document>
  )
}
