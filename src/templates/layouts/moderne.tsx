import { Document, Image, Page, View } from '@react-pdf/renderer'
import { sectionTitle } from '../../i18n/labels'
import { fullName, visibleSections } from '../../model/cv'
import type { Item, Lang, Section } from '../../model/types'
import { Entry, SectionFlow, SkillLevel, Text, contactList, entryMeta, fixBidi, ink, tint } from '../shared'
import { makeTheme } from '../theme'
import type { LayoutMeta, LayoutProps } from '../types'

export const meta: LayoutMeta = {
  id: 'moderne',
  order: 2,
  name: { fr: 'Moderne', en: 'Modern', es: 'Moderno', de: 'Modern', it: 'Moderno', pt: 'Moderno', ar: 'عصري' },
  category: 'moderne',
  columns: 2,
  photo: true,
  styles: [
    { name: 'Bandeau', variant: 'band', preset: { accent: '#c2410c', fontPair: 'inter', photoShape: 'circle', skillDisplay: 'text' } },
    { name: 'Nuit', variant: 'solid', preset: { accent: '#1e3a5f', fontPair: 'montserrat', photoShape: 'circle', skillDisplay: 'bars' } },
    { name: 'Marge', variant: 'right', preset: { accent: '#047857', fontPair: 'source', photoShape: 'rounded', skillDisplay: 'dots' } },
  ],
}

const MUTED = '#6b645b'
const CONTACT: Record<Lang, string> = { fr: 'Contact', en: 'Contact', es: 'Contacto', de: 'Kontakt', it: 'Contatto', pt: 'Contacto', ar: 'التواصل' }
const SIDE = 188 // largeur du bandeau latéral
const MAIN_KINDS = ['profile', 'experience', 'education', 'projects', 'custom']

export function Component({ cv, design, labels, variant }: LayoutProps) {
  const t = makeTheme(cv, design, labels)
  const { personal } = cv
  const solid = variant === 'solid'
  const right = variant === 'right'
  const sideAt = right ? t.end : t.start // côté du bandeau
  const sections = visibleSections(cv)
  const mainSections = sections.filter((s) => MAIN_KINDS.includes(s.kind))
  const sideSections = sections.filter((s) => !MAIN_KINDS.includes(s.kind)) // dans l'ordre choisi dans l'éditeur
  const contacts = contactList(cv, labels)

  const bg = solid ? ink(t.accent, '#ffffff', 7) : right ? tint('#374151', 0.94) : tint(t.accent, 0.9) // aplat : texte blanc >= 7:1
  const fg = solid ? '#ffffff' : '#3d382f'
  const acc = ink(t.accent) // accent en texte sur blanc
  const sideHead = solid ? fg : ink(t.accent, bg)
  const track = solid ? tint(bg, 0.6) : undefined
  const levelColor = solid ? fg : sideHead

  const mainTitle = (s: Section) =>
    right ? (
      <Text minPresenceAhead={90} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(9.5), color: acc, marginBottom: 3 }}>
        {t.rtl ? sectionTitle(s, labels) : sectionTitle(s, labels).toUpperCase()}
      </Text>
    ) : (
      <View style={{ borderBottomWidth: 0.8, borderBottomColor: t.accent, marginBottom: 2 }}>
        <Text minPresenceAhead={90} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(11.5), color: acc, marginBottom: 3 }}>{sectionTitle(s, labels)}</Text>
      </View>
    )

  const entry = (it: Item) => {
    const { period, sub } = entryMeta(it, cv, labels)
    return (
      <Entry
        key={it.id} text={it.text} rtl={t.rtl} style={{ marginTop: t.m(7) }}
        head={<>
          <Text style={{ fontWeight: 700, fontSize: t.s(10.5) }}>{it.title}</Text>
          {(!!sub || !!period) && <Text style={{ color: MUTED }}>{[sub, period].filter(Boolean).join('  |  ')}</Text>}
        </>}
      />
    )
  }

  const mainBody = (s: Section) =>
    s.kind === 'profile'
      ? <Text style={{ marginTop: 5 }}>{fixBidi(s.items.map((i) => i.text).filter(Boolean).join('\n'), t.rtl)}</Text>
      : s.items.map(entry)

  const sideBody = (s: Section) =>
    s.kind === 'interests'
      ? s.items.filter((i) => i.title.trim()).map((i) => <Text key={i.id} style={{ marginTop: 2, color: fg }}>{i.title}</Text>)
      : s.items.map((it) => (
          <View key={it.id} wrap={false} style={{ marginTop: t.m(4) }}>
            <Text style={{ fontWeight: 700, color: fg }}>{it.title}</Text>
            {!!it.text.trim() && <Text style={{ color: fg }}>{fixBidi(it.text, t.rtl)}</Text>}
            <View style={{ marginTop: 2 }}><SkillLevel it={it} t={t} color={levelColor} track={track} width={SIDE - 44} /></View>
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
        {/* Fond du bandeau : répété sur chaque page ; son contenu n'est que sur la page 1 */}
        <View fixed style={{ position: 'absolute', top: 0, bottom: 0, [sideAt]: 0, width: SIDE, backgroundColor: bg }} />
        {right && <View fixed style={{ position: 'absolute', top: 0, bottom: 0, [sideAt === 'left' ? 'left' : 'right']: SIDE, width: 1.5, backgroundColor: t.accent }} />}
        <View>
          <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(26), lineHeight: 1.15 }}>{fullName(cv)}</Text>
          {!!personal.title.trim() && <Text style={{ fontSize: t.s(12.5), color: acc, marginTop: 4 }}>{personal.title}</Text>}
        </View>
        {mainSections.map((s) => (
          <SectionFlow key={s.id} gap={t.m(18)} title={mainTitle(s)}>{mainBody(s)}</SectionFlow>
        ))}
        {/* Déclarée en dernier : le nom et le poste sortent avant la colonne dans le texte extrait (ATS) ; position absolue = rendu inchangé. */}
        <View style={{ position: 'absolute', top: t.m(38), [sideAt]: 0, width: SIDE, paddingHorizontal: 20, color: fg }}>
          {!!personal.photo && <View style={{ alignItems: 'center', marginBottom: 14 }}><Image src={personal.photo} style={t.photo(100)} /></View>}
          {contacts.length > 0 && (
            <View>
              <Text style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(11.5), color: sideHead, marginBottom: 3 }}>{CONTACT[cv.lang]}</Text>
              {contacts.map((c, i) => <Text key={i} style={{ marginTop: 3, color: fg }}>{c}</Text>)}
            </View>
          )}
          {sideSections.map((s) => (
            <View key={s.id} style={{ marginTop: t.m(15), color: fg }}>
              <Text minPresenceAhead={90} style={{ fontFamily: t.head, fontWeight: 700, fontSize: t.s(11.5), color: sideHead, marginBottom: 3 }}>{sectionTitle(s, labels)}</Text>
              {sideBody(s)}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
