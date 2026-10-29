// Parcours de démonstration enregistré en vidéo puis converti en docs/images/demo.gif (ffmpeg requis).
// Un `vite preview` doit tourner ; port via SCREENS_URL (défaut :4173). Thème sombre par défaut (DEMO_SCHEME=light pour le clair). Lancer : pnpm demo:gif
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.SCREENS_URL ?? 'http://localhost:4173'
const FFMPEG = process.env.FFMPEG ?? '/opt/homebrew/bin/ffmpeg'
const dir = 'out/demo'
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })
mkdirSync('docs/images', { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'fr-FR', colorScheme: process.env.DEMO_SCHEME === 'light' ? 'light' : 'dark', recordVideo: { dir, size: { width: 1280, height: 800 } } })
const page = await ctx.newPage()
const pause = (ms: number) => page.waitForTimeout(ms)

await page.goto(`${BASE}/`)
await page.waitForSelector('canvas', { state: 'attached', timeout: 20000 })
await pause(2000)
await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
await page.waitForSelector('canvas', { state: 'attached', timeout: 20000 })
await pause(1500)
await page.getByRole('button', { name: 'Moderne · Bandeau' }).click()
await pause(1500)
await page.getByRole('button', { name: 'Vente et accueil' }).click()
await pause(2500)
await page.getByRole('button', { name: 'Minimal · Gouttière' }).click()
await pause(1500)
await pause(500)
await page.getByRole('navigation', { name: 'Étapes' }).getByRole('button', { name: 'Design' }).click()
await pause(1000)
await page.getByRole('button', { name: 'Violet', exact: true }).click()
await pause(2000)
await page.getByRole('button', { name: 'Télécharger le PDF' }).first().hover()
await pause(1500)

await ctx.close()
await browser.close()
const webm = `${dir}/${readdirSync(dir).find((f) => f.endsWith('.webm'))}`
renameSync(webm, `${dir}/demo.webm`)
const vf = 'fps=12,scale=960:-1:flags=lanczos'
execFileSync(FFMPEG, ['-y', '-i', `${dir}/demo.webm`, '-vf', `${vf},split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, 'docs/images/demo.gif'], { stdio: 'inherit' })
