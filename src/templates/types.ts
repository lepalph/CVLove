import type { ComponentType } from 'react'
import type { CVLabels } from '../i18n/labels'
import type { LetterLabels } from '../i18n/letter'
import type { CV, Design, Lang, Letter } from '../model/types'

/**
 * TEMPLATE CONTRACT (v2)
 * ======================
 * Vocabulary: a LAYOUT is a react-pdf component (`layouts/<id>.tsx`); a STYLE is a design preset (font, color, photo shape,
 * levels) + a `variant` (string) that the component interprets; a TEMPLATE = layout + style.
 * A template id is `<layout id>-<style number, 1 to 3>` (e.g. `moderne-2`); it is `design.templateId`.
 *
 * Adding a layout = ONE file `src/templates/layouts/<id>.tsx`, without touching the registry (`index.ts` builds it
 * with `import.meta.glob`). The file exports:
 *   - `meta: LayoutMeta`  : id (= file name), name per interface language, category, columns, photo, `order` (rank in the gallery)
 *                           and EXACTLY 3 styles. Never reorder or remove an existing style (saved documents depend on their ids).
 *   - `Component`         : `(LayoutProps) => <Document>` react-pdf. Models to follow: `layouts/classique.tsx` (one column) and `moderne.tsx` (two columns).
 * Steps: 1) copy the closest file; 2) change `meta` (3 styles: its own `name`, not translated; `variant`; `preset` = accent,
 * fontPair, photoShape, skillDisplay... The preset is applied each time the template is chosen, the user can then override everything);
 * 3) vary the structure or the header according to `variant`; 4) `pnpm check:pdf` (renders every template x 7 languages + edge cases) and look at `out/<id>-1-fr.png` etc.;
 * 5) style no. 1 also serves as the "default" template of its layout.
 *
 * The component receives `{ cv, design, labels, variant }` and MUST honor all design options, through `makeTheme` (theme.ts):
 *   const t = makeTheme(cv, design, labels)
 *   t.head / t.body        font stack (chosen pair, Tajawal as fallback for Arabic; Tajawal alone in Arabic); weights 400 and 700 only
 *   t.s(n)                 font size in pt x fontScale  -> ALL fontSize values go through t.s()
 *   t.m(n)                 margin / spacing x margin setting (compact 0.75, normal 1, wide 1.3) -> page paddings via t.m()
 *   t.pageProps / t.pageStyle(padV, padH)   <Page {...t.pageProps} style={t.pageStyle(40, 44)}>: A4/Letter format, font, line height, RTL
 *   t.accent, t.row, t.rtl, t.start/t.end   color, 'row' | 'row-reverse', 'left'|'right' depending on reading direction (yoga does not inherit `direction` for rows)
 *   t.photo(size)          style (width, height, borderRadius, objectFit) according to design.photoShape; <Image src={cv.personal.photo} style={t.photo(80)} />
 * Rendering helpers in `shared.tsx`: <Text> (USE it instead of react-pdf's: paragraph direction from its content, bidi), <Entry> (job entry:
 *   header + first line unbreakable, the rest may move to the next page), <SectionFlow> (title + content as direct siblings: a title is never alone at the bottom of a page),
 *   ink (accent >= 4.5:1 on white, or `ink(accent, '#fff', 7)` for a solid fill carrying white text: no local helper), <Lines> (bullets), <ContactRow>, contactList, fixBidi (RTL), tint (background tinted with the accent),
 *   shade (darkened accent), onAccent (readable text on a free-color background), <SkillLevel> (level 1-5 as bars / dots / text
 *   according to design.skillDisplay), entryMeta (period + subtitle of an item).
 * From the data model: visibleSections / visibleFields / fullName (model/cv), sectionTitle (i18n/labels), formatPeriod / formatDay (model/dates).
 * `meta` must remain a pure literal (no variable or import inside), declared `export const meta: LayoutMeta = {` with its closing `}` alone at the start
 * of a line: the `vite-layout-meta.ts` plugin extracts it so that the first load does not bundle react-pdf.
 * Rules: empty sections hidden (visibleSections), <Entry> for entries, <SectionFlow> for sections, no letterSpacing (it splits words on ATS extraction), no hyphenation, `language={cv.lang}` on <Document>,
 * entered content is never translated, the free color can be very light or very dark (use tint/shade/onAccent).
 * Visual test: `pnpm check:pdf` writes the PNGs to `out/`. Node scripts load the sources through Vite (`scripts/vite-load.ts`): this is what
 * makes `import.meta.glob` work outside the browser.
 */
export interface LayoutProps {
  cv: CV
  design: Design
  labels: CVLabels
  /** `StyleDef.variant` of the chosen template. */
  variant: string
}

export const CATEGORIES = ['classique', 'moderne', 'creatif', 'simple'] as const
export type Category = (typeof CATEGORIES)[number]

export interface StyleDef {
  /** Proper name of the style (same in every language). */
  name: string
  variant: string
  /** Design values applied when the user picks this template. */
  preset: Partial<Omit<Design, 'templateId'>>
}

export interface LayoutMeta {
  /** File name without extension. */
  id: string
  name: Record<Lang, string>
  category: Category
  columns: 1 | 2
  /** The layout displays the photo. */
  photo: boolean
  /** Rank in the gallery. */
  order: number
  styles: [StyleDef, StyleDef, StyleDef]
}

export interface LayoutModule {
  Component: ComponentType<LayoutProps>
  meta: LayoutMeta
}

/** A template (layout x style) as the registry serves it to the gallery and to rendering. */
export interface TemplateDef {
  id: string
  layoutId: string
  layoutName: Record<Lang, string>
  styleName: string
  /** Style number within its layout (1 to 3): the interface can show "Classique 2" rather than the French name in other scripts. */
  styleNo: 1 | 2 | 3
  category: Category
  columns: 1 | 2
  photo: boolean
  variant: string
  preset: StyleDef['preset']
  /** Deferred loading of the component: react-pdf stays out of the first load. */
  load: () => Promise<{ Component: ComponentType<LayoutProps> }>
}

/** Suggested accent swatches (the color remains free). */
export const ACCENTS = ['#c2410c', '#1d4ed8', '#047857', '#7c3aed', '#be185d', '#0e7490', '#374151'] as const

/**
 * COVER LETTERS: same principle as CV layouts, in `letters/<id>.tsx` (id = file name = `design.templateId`,
 * prefixed `lettre-`), automatic registry `letterTemplates.ts`. The file exports `meta: LetterMeta` (pure literal, as for CVs)
 * and `Component: (LetterProps) => <Document>`. Same theme (`makeTheme(letter, design, cvLabels[letter.lang])`): size, line height,
 * margins, A4 / Letter, RTL. The shared pieces (recipient, subject, paragraphs, closing) are in `letterShared.tsx`.
 */
export interface LetterProps {
  letter: Letter
  design: Design
  labels: LetterLabels
}

export interface LetterMeta {
  /** File name without extension, = `design.templateId`. */
  id: string
  name: Record<Lang, string>
  order: number
}

export interface LetterModule {
  Component: ComponentType<LetterProps>
  meta: LetterMeta
}
