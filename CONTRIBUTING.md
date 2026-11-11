# Contributing to CVLove

CVLove is a CV and cover letter generator that runs entirely in the browser. Contributions are welcome: bug reports, layouts, letters, languages, font pairs.

## Privacy rule (not negotiable)

CVLove makes no network request to any other domain and has no analytics, tracking or telemetry. A change that adds one will not be merged. Fonts, images and data are bundled with the app.

## Setup

Requirements: Node 24 and pnpm.

```sh
pnpm install
pnpm dev          # dev server
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server |
| `pnpm build` | Type check (`tsc --noEmit`) and production build |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm check:pdf` | Renders every template in the 7 languages plus edge cases, checks that text is extractible, writes PNGs to `out/`; then runs the ATS checks (`scripts/check-pdf-ats.ts`). A full run takes about 1.5 minutes on a small laptop. To render only some jobs, set `ONLY` (see below) |
| `pnpm test:e2e` | Builds, then runs the Playwright tests in `tests/e2e` |

For e2e, install the browser once: `pnpm exec playwright install chromium` (about 1.5 GB of disk). The e2e run itself takes under a minute.

### Render only your layout with `ONLY`

`ONLY=<regex>` is read by `scripts/check-pdf.ts`. A render job is kept when the regex matches its name, and the match is not anchored. Template jobs are named `<template id>/<case>`, for example `moderne-2/fr` or `moderne-2/en long + photo`. Examples:

```sh
ONLY='^ruban-' pnpm check:pdf     # the 3 styles of a layout named ruban, all cases
ONLY='^ruban-1/fr$' pnpm check:pdf
```

If nothing matches, the script prints a `KO` line. `scripts/check-pdf-ats.ts` ignores `ONLY` and still runs after the first script succeeds. Before opening a PR, run `pnpm check:pdf` without `ONLY` once.

The PNGs in `out/` are named `<template id>-fr` and `<template id>-ar` (sample CV), `long-<template id>-en` and `-ar` (2 pages), `letter-<template id>-fr` (Letter format) and `max-<template id>-en` (large font, wide margins). The other languages are checked on extracted text only, not on images.

## Repository layout

- `src/model/`: data model, defaults, sample CV, date helpers
- `src/i18n/`: translations (interface, CV labels, letters)
- `src/templates/`: layout registry, theme, shared helpers; `layouts/` (CV) and `letters/` (cover letters)
- `src/pdf/`: react-pdf rendering, font registration, font pairs
- `src/ui/`: editor and gallery
- `scripts/`: PDF checks, font generation
- `public/fonts/`: bundled fonts and their OFL licenses
- `tests/e2e/`: Playwright tests

## Add a CV layout

The contract is documented at the top of `src/templates/types.ts`. Summary:

1. Check the table below, then the catalog (`pnpm dev`, home page). Do not propose a layout that already exists, even under another name.
2. Copy the closest file in `src/templates/layouts/` (`classique.tsx` for one column, `moderne.tsx` for two) to `src/templates/layouts/<id>.tsx`. The id is the file name.
3. Edit `meta`: id, `name` in the 7 languages, `category`, `columns`, `photo`, `order`, and exactly 3 styles. Each style has a proper `name`, a `variant` string and a `preset` (accent, `fontPair`, `photoShape`, `skillDisplay`). `meta` must stay a pure literal, declared as `export const meta: LayoutMeta = {` with the closing `}` alone at the start of a line (`vite-layout-meta.ts` extracts it).
   - `category` is one of `classique`, `moderne`, `creatif`, `simple` (the list is closed, in `types.ts`). It feeds the category filter of the gallery. Pick the closest one.
   - `order` is the rank in the gallery, sorted ascending. Use the next free number.
   - Two-column layouts list in `apart` the section kinds of the side block (side column or grid). Usual split: skills, languages, certifications and interests apart; experience, volunteering, education, projects and publications in the main column. `pnpm check:pdf` checks that the editor order is kept inside each block.
4. Build the component with `makeTheme(cv, design, labels)`: all font sizes go through `t.s()`, margins through `t.m()`, the page through `t.pageProps` and `t.pageStyle()`. Honor RTL with `t.row`, `t.start` and `t.end`.
5. Use the helpers in `src/templates/shared.tsx` (all exported):
   - `Text`: use it instead of the react-pdf one (paragraph direction, bidi).
   - `Entry`: a job entry; header and first line stay together.
   - `SectionFlow`: title and content as siblings, so a title is never alone at the bottom of a page.
   - `Lines`: description lines with bullets.
   - `ContactRow` and `contactList`: contact details, links included.
   - `linked`: makes an e-mail, phone or URL clickable without changing its look.
   - `colon`: the separator between a label and its value (a non-breaking space before the colon in French only).
   - `entryMeta`: period and "subtitle · place" of an item.
   - `SideEntry`: a short item in a side column (title, then "subtitle · date"), used for certifications.
   - `SkillLevel`: a level from 1 to 5 as bars, dots or text.
   - `fixBidi`: right-to-left fixes and non-breaking space before `%`.
   - `ink`, `onAccent`, `tint`, `shade`, `contrast`: color helpers (see the contrast rule below).
   
   Do not use `letterSpacing` (it breaks ATS extraction) and do not enable hyphenation.
6. There is no registry to edit: `src/templates/index.ts` finds the file with `import.meta.glob`.
7. Never reorder or remove a style in an existing layout: saved documents refer to `<id>-<n>`.
8. Run `ONLY='^<id>-' pnpm check:pdf`, look at the PNGs in `out/`, then run the full `pnpm check:pdf` once.
9. Update the counts and the table, see "Keep counts and tables current" below.

### Existing layouts

Generated from the `meta` of each file in `src/templates/layouts/`, sorted by `order`. The ideas are short descriptions, not taken from the code.

| order | id | idea | columns | photo | category | styles |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `classique` | traditional serif résumé | 1 | yes | classique | Académique, Chancellerie, Gazette |
| 2 | `moderne` | colored side column with contacts | 2 | yes | moderne | Bandeau, Nuit, Marge |
| 3 | `minimal` | plain text, lots of white | 1 | yes | simple | Épuré, Gouttière, Filet |
| 4 | `creatif` | colored header across the page | 1 | yes | creatif | Aplat, Pastel, Étiquette |
| 5 | `chronologie` | experience on a timeline | 1 | yes | moderne | Frise, Jalons, Repères |
| 6 | `lateral-droit` | main text, narrow side margin | 2 | no | moderne | Filet, Capitales, Marginalia |
| 7 | `compact` | dense two columns, no photo | 2 | no | simple | Dense, Repère, Fiche |
| 8 | `executif` | formal serif with rules and frames | 1 | no | classique | Doublé, Cadre, Étude |
| 9 | `blocs` | sections as colored blocks | 1 | yes | creatif | Pastel, Pavé, Papier |
| 10 | `colonne-pleine` | full-height colored side column | 2 | yes | creatif | Encre, Lisière, Cartouche |
| 11 | `tableau` | form look with rules and tints | 1 | yes | classique | Dossier, Registre, Greffe |
| 12 | `grille` | two-column grid, no photo | 2 | no | moderne | Filet, Bandeau plein, Épure |

A new layout must differ in structure, not only in colors or fonts: that is what the 3 styles are for.

### Full-width backgrounds

`t.pageStyle(padV, padH)` always adds the page padding, so a colored band that reaches the page edge needs one of two techniques already used in the repository:

- Negative margins on a header block: `creatif.tsx` gives its header `marginTop: -padV` and `marginHorizontal: -padH`, the same values as the page padding. The band follows the margin setting. It exists on page 1 only; page 2 keeps its normal padding.
- A `fixed` absolutely positioned `View` with a background: `moderne.tsx` and `colonne-pleine.tsx` remove the horizontal padding from the page style and draw the side column as `<View fixed style={{ position: 'absolute', top: 0, bottom: 0, ... }}>`. The background repeats on every page. The content of the column is on page 1 only, so a column that is too long overflows.

### Contrast of the accent

No test checks a layout for contrast. `src/templates/lotb.test.ts` tests `ink()` and `onAccent()` alone, and `pnpm check:pdf` measures no contrast. The rule is therefore a code rule plus a visual check:

- Any colored text uses `ink(t.accent)`. Text on a solid accent fill uses `onAccent(t.accent)` or `ink(t.accent, '#fff', 7)` for the fill. Never put `t.accent` directly in a text color.
- To check, set the accent in your `preset` to `#ffffff`, then `#facc15`, then `#000000`, run `ONLY='^<id>-1/fr$' pnpm check:pdf`, open `out/<id>-1-fr.png`, and undo the change. Every text must stay readable.

### Keep counts and tables current

The README files no longer state how many layouts or templates exist, but some places still do. When you add a layout:

- add a row to the table above;
- check `src/templates/lotb.test.ts` (a comment says "12 mises en page");
- regenerate `docs/images/templates.png` if the catalog screenshot changes noticeably.

### Code style

There is no linter and no formatter: CI runs only build, tests, PDF checks and e2e. Follow the style of the file you copied: TypeScript, 2 spaces, single quotes, no semicolons. `pnpm build` runs the type check, which must pass.

## Add a cover letter

Same principle in `src/templates/letters/<id>.tsx`. The id is the file name and starts with `lettre-`. Export `meta: LetterMeta` (pure literal) and `Component`. Use `makeTheme` and the shared pieces in `src/templates/letterShared.tsx`. The registry is `src/templates/letterTemplates.ts` (automatic).

## Add a language

1. Add the code to `LANGS` in `src/model/types.ts`.
2. Add the entry for the new code in each `Record<Lang, ...>` in `src/i18n/`: `ui.ts`, `labels.ts`, `letter.ts` (`letterLabels` and `letterUi`), `guide.ts`, `v2.ts`, and check `home.ts` and `extra.ts`. `pnpm build` fails on any missing entry.
3. Layout `meta.name` records are also typed `Record<Lang, string>`: add the name in each layout and letter.
4. If the script is not covered by the bundled fonts, see the font section below. Right-to-left scripts need the RTL checks.
5. `pnpm check:pdf` renders every template in every language.

## Add a font pair

1. Fonts must be under the SIL OFL. Static TTF files, weights 400 and 700 only (react-pdf does not handle variable axes).
2. Generate them with `scripts/make-fonts.py` (`uv run --with fonttools scripts/make-fonts.py <google-fonts ofl dir> public/fonts`). Add the family to `jobs` there. Families with a Reserved Font Name must be renamed.
3. Copy the family license to `public/fonts/OFL-<family>.txt`.
4. Register the files in `FILES` in `src/pdf/fonts.ts`.
5. Add the pair name to `FONT_PAIRS` in `src/model/types.ts` and its entry in `FONT_PAIR_DEFS` in `src/pdf/fontPairs.ts`.
6. `pnpm check:pdf` renders every font pair.

## Template acceptance criteria

A PR that adds or changes a layout needs all of these:

- [ ] Renders correctly on A4 in the 7 languages (fr, en, es, de, it, pt, ar), including Arabic right-to-left.
- [ ] A long CV paginates cleanly over 2 pages: no heading alone at the bottom of a page, no entry cut after its header.
- [ ] Text is extractible: `pnpm check:pdf` passes (it includes the ATS checks). The PNGs to look at are listed under `ONLY` above.
- [ ] The accent color keeps enough contrast (4.5:1 on white for text, via `ink`), also with very light and very dark custom colors. Checked by eye, see "Contrast of the accent".
- [ ] No remote resource: fonts and images are local, no URL fetched at runtime.
- [ ] No new dependency, or a justification in the PR description.
- [ ] `pnpm build`, `pnpm test` and `pnpm test:e2e` pass.
- [ ] Screenshots (PNGs from `out/`) are attached to the PR.

## Commits and pull requests

Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. Keep a PR focused on one change. CI runs build, tests, PDF checks and e2e on every push and pull request.
