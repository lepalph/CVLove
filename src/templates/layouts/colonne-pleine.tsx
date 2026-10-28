import { Document, Image, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Section } from '../../model/types'
import { Entry, SectionFlow, SkillLevel, Text, contactList, entryMeta, fixBidi, ink, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'colonne-pleine',
  order: 10,
  name: { fr: 'Colonne pleine', en: 'Full column', es: 'Columna completa', de: 'Volle Spalte', it: 'Colonna piena', pt: 'Coluna cheia', ar: 'عمود كامل' },
  category: 'creatif',
  columns: 2,
  photo: true,
  styles: [
    { name: 'Encre', variant: 'ink', preset: { accent: '#1d4ed8', fontPair: 'inter', photoShape: 'circle', skillDisplay: 'bars' } },
    { name: 'Lisière', variant: 'right', preset: { accent: '#047857', fontPair: 'source', photoShape: 'rounded', skillDisplay: 'dots' } },
    { name: 'Cartouche', variant: 'plate', preset: { accent: '#c2410c', fontPair: 'playfair', photoShape: 'square', skillDisplay: 'text' } },
  ],
}

const MUTED = '#5c564d'
const SIDE = 196
const MAIN_KINDS = ['profile', 'experience', 'education', 'projects', 'custom']

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const right = variant === 'right'
  const plate = variant === 'plate'
  const sideAt = right ? t.end : t.start
  const sections = visibleSections(cv)
  const mainSections = sections.filter((s) => MAIN_KINDS.includes(s.kind))
  const sideSections = [...sections.filter((s) => !MAIN_KINDS.includes(s.kind) && s.kind !== 'interests'), ...sections.filter((s) => s.kind === 'interests')]
  const contacts = contactList(cv, labels)

  const bg = ink(t.accent, '#ffffff', 7) // texte blanc >= 7:1 sur l'aplat, quel que soit l'accent
  const fg = '#ffffff'
  const soft = tint(bg, 0.85) // texte secondaire : reste >= 4.5:1 sur un fond à 7:1
  const track = tint(bg, 0.5)
  const mainInk = ink(t.accent)

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <Entry
        key={it.id} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(7) }}
        head={<>
          <View style={{ flexDirection: t.row, justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, fontWeight: 700, fontSize: t.s(10.5) }}>{it.title}</Text>
            {!!period && <Text style={{ color: MUTED }}>{period}</Text>}
          </View>
          {!!sub && <Text style={{ color: MUTED }}>{sub}</Text>}
        </>}
      />
    )
  }

  const sideBody = (s: Section) =>
    s.kind === 'interests'
      ? s.items.filter((i) => i.title.trim()).map((i) => <Text key={i.id} style={{ marginTop: 2, color: fg }}>{i.title}</Text>)
      : s.items.map((it) => (
          <View key={it.id} wrap={false} style={{ marginTop: t.m(4) }}>
            <Text style={{ fontWeight: 700, color: fg }}>{it.title}</Text>
            {!!it.text.trim() && <Text style={{ color: soft }}>{fixBidi(it.text, t.rtl)}</Text>}
            <View style={{ marginTop: 2 }}><SkillLevel it={it} t={t} color={fg} track={track} width={SIDE - 48} /></View>
          </View>
        ))

  const { paddingHorizontal: _h, ...pageBase } = t.pageStyle(38, 0)
  const side = SIDE + 28
  const edge = t.m(34)
  const pad = right
    ? { [t.rtl ? 'paddingLeft' : 'paddingRight']: side, [t.rtl ? 'paddingRight' : 'paddingLeft']: edge }
    : { [t.rtl ? 'paddingRight' : 'paddingLeft']: side, [t.rtl ? 'paddingLeft' : 'paddingRight']: edge }

  return (
    <Document title={fullName(cv)} author={fullName(cv)} language={cv.lang}>
      <Page {...t.pageProps} style={{ ...pageBase, ...pad }}>
        {/* Aplat : `fixed` + position absolue = pleine hauteur sur CHAQUE page. Son contenu n'est que sur la page 1 (limite : colonne trop longue = débordement). */}
        <View fixed style={{ position: 'absolute', top: 0, bottom: 0, [sideAt]: 0, width: SIDE, backgroundColor: bg }} />
        <View style={{ position: 'absolute', top: 0, [sideAt]: 0, width: SIDE, paddingTop: t.m(38), paddingHorizontal: 20 }}>
          {!!personal.photo && <View style={{ alignItems: 'center', marginBottom: 14 }}><Image src={personal.photo} style={t.photo(112)} /></View>}
          <View style={plate ? { borderTopWidth: 2, borderBottomWidth: 2, borderColor: fg, paddingVertical: 8 } : {}}>
            <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(20), lineHeight: 1.2, color: fg, ...(plate ? { textAlign: 'center' } : {}) }}>{fullName(cv)}</Text>
            {!!personal.title.trim() && <Text style={{ fontSize: t.s(10.5), marginTop: 3, color: soft, ...(plate ? { textAlign: 'center' } : {}) }}>{personal.title}</Text>}
          </View>
          {contacts.length > 0 && <View style={{ marginTop: t.m(14) }}>{contacts.map((c, i) => <Text key={i} style={{ marginTop: 3, color: fg }}>{c}</Text>)}</View>}
          {sideSections.map((s) => (
            <View key={s.id} style={{ marginTop: t.m(15) }}>
              <Text minPresenceAhead={90} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(11), color: fg, paddingBottom: 2, marginBottom: 2, borderBottomWidth: 0.6, borderBottomColor: track }}>{sectionTitle(s, labels)}</Text>
              {sideBody(s)}
            </View>
          ))}
        </View>

        {mainSections.map((s, i) => (
          <SectionFlow
            key={s.id} gap={i === 0 ? 0 : t.m(18)}
            title={
              <View style={{ borderBottomWidth: 0.8, borderBottomColor: mainInk, marginBottom: 2 }}>
                <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(12), color: mainInk, marginBottom: 3 }}>{sectionTitle(s, labels)}</Text>
              </View>
            }
          >
            {s.kind === 'profile'
              ? <Text style={{ marginTop: 5 }}>{fixBidi(s.items.map((x) => x.text).filter(Boolean).join('\n'), t.rtl)}</Text>
              : s.items.map(entry)}
          </SectionFlow>
        ))}
      </Page>
    </Document>
  )
}
