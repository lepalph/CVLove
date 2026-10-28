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
| `pnpm check:pdf` | Renders every template in the 7 languages plus edge cases, checks that text is extractible, writes PNGs to `out/`; then runs the ATS checks (`scripts/check-pdf-ats.ts`) |
| `pnpm test:e2e` | Builds, then runs the Playwright tests in `tests/e2e` |

For e2e, install the browser once: `pnpm exec playwright install chromium`.

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

1. Copy the closest file in `src/templates/layouts/` (`classique.tsx` for one column, `moderne.tsx` for two) to `src/templates/layouts/<id>.tsx`. The id is the file name.
2. Edit `meta`: id, `name` in the 7 languages, category, columns, photo, `order`, and exactly 3 styles. Each style has a proper `name`, a `variant` string and a `preset` (accent, `fontPair`, `photoShape`, `skillDisplay`). `meta` must stay a pure literal, declared as `export const meta: LayoutMeta = {` with the closing `}` alone at the start of a line (`vite-layout-meta.ts` extracts it).
3. Build the component with `makeTheme(cv, design, labels)`: all font sizes go through `t.s()`, margins through `t.m()`, the page through `t.pageProps` and `t.pageStyle()`. Honor RTL with `t.row`, `t.start` and `t.end`.
4. Use the helpers in `src/templates/shared.tsx`: `Text` (instead of the react-pdf one), `Entry`, `SectionFlow`, `ink`, `tint`, `shade`, `onAccent`, `SkillLevel`, `ContactRow`. Do not use `letterSpacing` (it breaks ATS extraction) and do not enable hyphenation.
5. There is no registry to edit: `src/templates/index.ts` finds the file with `import.meta.glob`.
6. Never reorder or remove a style in an existing layout: saved documents refer to `<id>-<n>`.
7. Run `pnpm check:pdf` and look at `out/<id>-1-fr.png` and the other PNGs.

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
- [ ] Text is extractible: `pnpm check:pdf` passes (it includes the ATS checks).
- [ ] The accent color keeps enough contrast (4.5:1 on white for text, via `ink`), also with very light and very dark custom colors.
- [ ] No remote resource: fonts and images are local, no URL fetched at runtime.
- [ ] No new dependency, or a justification in the PR description.
- [ ] `pnpm build`, `pnpm test` and `pnpm test:e2e` pass.
- [ ] Screenshots (PNGs from `out/`) are attached to the PR.

## Commits and pull requests

Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. Keep a PR focused on one change. CI runs build, tests, PDF checks and e2e on every push and pull request.
