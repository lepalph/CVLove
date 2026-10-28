// Captures de l'app dans out/screens/ (un `vite preview` doit tourner ; port via SCREENS_URL, défaut :4173).
// Par taille (1440, 390) x thème (light, dark) x langue (fr, ar) : accueil, catalogue, éditeur guidé (Modèle, Expérience), éditeur complet, Mes documents.
import { mkdirSync } from 'node:fs'
import { chromium, type Page } from 'playwright'
import { guide } from '../src/i18n/guide'
import type { Lang } from '../src/model/types'

const BASE = process.env.SCREENS_URL ?? 'http://localhost:4173'
mkdirSync('out/screens', { recursive: true })

/** Parcourt la page pour déclencher le chargement paresseux des vignettes. */
const scrollAll = (page: Page) =>
  page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)) } scrollTo(0, 0) })

const browser = await chromium.launch()
for (const [size, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]] as const) {
  for (const scheme of ['light', 'dark'] as const) {
    for (const lang of ['fr', 'ar'] as Lang[]) {
      const g = guide[lang]
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: lang, colorScheme: scheme, deviceScaleFactor: 1 })
      const page = await ctx.newPage()
      page.on('pageerror', (e) => console.log('pageerror', e.message))
      page.on('console', (m) => m.type() === 'error' && console.log('console', m.text()))
      const name = `${size}-${scheme}-${lang}`
      const shot = (n: string, full = false) => page.screenshot({ path: `out/screens/${n}-${name}.png`, fullPage: full })

      // Accueil (hero) puis catalogue complet (section #modeles, vignettes chargées)
      await page.goto(`${BASE}/`)
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' })
      await page.waitForSelector('canvas', { state: 'attached', timeout: 20000 })
      await scrollAll(page)
      await page.waitForFunction(() => document.querySelectorAll('#modeles canvas').length >= 8, null, { timeout: 40000 })
      await page.waitForTimeout(800)
      await shot('accueil', true)
      await page.addStyleTag({ content: 'header{position:static!important}' }) // l'en-tête collant ne doit pas recouvrir la capture de la section
      await page.locator('#modeles').screenshot({ path: `out/screens/catalogue-${name}.png` })

      // Éditeur guidé : un nouveau document démarre en guidé (étape Modèle), puis étape Expérience
      await page.goto(`${BASE}/#/editeur`)
      await page.waitForSelector('canvas', { state: 'attached', timeout: 20000 })
      await page.waitForTimeout(2500)
      await shot('editeur-guide-modele')
      const goto = async (k: number) => {
        if (size === 'mobile') await page.getByRole('combobox', { name: g.stepsLabel }).selectOption(String(k))
        else await page.getByRole('navigation', { name: g.stepsLabel }).getByRole('button', { name: g.steps[k] }).click()
        await page.waitForTimeout(1200)
      }
      await goto(3)
      await shot('editeur-guide-experience')
      if (size === 'mobile') {
        await page.getByRole('tab').nth(1).click()
        await page.waitForTimeout(1500)
        await shot('apercu')
        await page.getByRole('tab').nth(0).click()
      }

      // Éditeur complet
      await page.getByRole('button', { name: g.full, exact: true }).click()
      await page.waitForTimeout(1500)
      await shot('editeur-complet')

      // Mes documents
      await page.goto(`${BASE}/#/documents`)
      await page.waitForTimeout(600)
      await shot('documents')
      await ctx.close()
    }
  }
}
await browser.close()
