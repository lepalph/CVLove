// Pré-rend en WebP la page 1 du CV d'exemple de chaque mise en page du hero, dans chaque langue : public/vignettes/<lang>-<modèle>.webp
// (pas versionné : .gitignore). L'accueil affiche cette image au lieu de charger react-pdf, pdf.js et les polices (docs/wiki/poids-chargement.md).
// Lancé par `pnpm build` ; sans effet si rien n'a changé (empreinte des sources dans public/vignettes/.stamp). `--force` pour refaire.
import { createCanvas } from '@napi-rs/canvas'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { DEFAULT_DESIGN } from '../src/model/cv'
import { sampleCV } from '../src/model/sample'
import { LANGS } from '../src/model/types'
import { HOME_LAYOUTS } from '../src/ui/homeLayouts'
import { SAMPLE_PHOTO } from '../src/ui/samplePhoto'
import { startLoader } from './vite-load'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = join(root, 'public/vignettes')
const WIDTH = 800 // px : hero à 2x (≈ 400 px de large à l'écran) ; la grille en affiche la moitié

// Empreinte : tout ce qui change le rendu du PDF d'exemple (modèles, modèle de données, i18n, polices, ce script).
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const files = ['src/templates', 'src/model', 'src/pdf', 'src/i18n', 'src/ui/samplePhoto.ts', 'public/fonts', 'scripts/make-vignettes.ts', 'package.json'].flatMap((p) => (statSync(join(root, p)).isDirectory() ? walk(join(root, p)) : [join(root, p)])).sort()
const hash = createHash('sha1')
for (const f of files) hash.update(f).update(readFileSync(f))
const stamp = hash.digest('hex')
if (!process.argv.includes('--force') && existsSync(join(out, '.stamp')) && readFileSync(join(out, '.stamp'), 'utf8') === stamp) {
  console.log('vignettes à jour')
  process.exit(0)
}

const loader = await startLoader()
const { layouts, getTemplate } = await loader.load('/src/templates/index.ts')
const { renderPdf } = await loader.load('/src/pdf/render.tsx')
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
const t0 = Date.now()
for (const l of layouts.filter((l: any) => HOME_LAYOUTS.includes(l.layoutId))) {
  const tpl = getTemplate(l.id)
  for (const lang of LANGS) {
    const cv = sampleCV(lang)
    if (tpl.photo) cv.personal.photo = SAMPLE_PHOTO // comme SamplePage
    const bytes = await renderPdf(cv, { ...DEFAULT_DESIGN, ...tpl.preset, templateId: l.id }, join(root, 'public/fonts/'))
    const doc = await getDocument({ data: bytes, useSystemFonts: false, verbosity: 0 }).promise
    const page = await doc.getPage(1)
    const vp = page.getViewport({ scale: WIDTH / page.getViewport({ scale: 1 }).width })
    const canvas = createCanvas(vp.width, vp.height)
    await page.render({ canvasContext: canvas.getContext('2d') as any, viewport: vp, canvas: canvas as any }).promise
    writeFileSync(join(out, `${lang}-${l.id}.webp`), canvas.encodeSync('webp', 75))
  }
}
writeFileSync(join(out, '.stamp'), stamp)
console.log(`vignettes : ${readdirSync(out).length - 1} images en ${Math.round((Date.now() - t0) / 1000)} s`)
await loader.close()
