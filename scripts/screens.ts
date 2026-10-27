// Captures de l'app dans out/screens/ (un `vite preview` doit tourner ; port via SCREENS_URL, défaut :4173).
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.SCREENS_URL ?? 'http://localhost:4173'
mkdirSync('out/screens', { recursive: true })
const browser = await chromium.launch()
for (const [size, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]] as const) {
  for (const scheme of ['light', 'dark'] as const) {
    for (const lang of ['fr', 'ar']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: lang, colorScheme: scheme, deviceScaleFactor: 1 })
      const page = await ctx.newPage()
      page.on('pageerror', (e) => console.log('pageerror', e.message))
      page.on('console', (m) => m.type() === 'error' && console.log('console', m.text()))
      const name = `${size}-${scheme}-${lang}`
      await page.goto(`${BASE}/`)
      await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" })
      await page.waitForSelector('canvas', { state: 'attached', timeout: 20000 })
      // Force le chargement paresseux des vignettes avant la capture pleine page
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } scrollTo(0, 0) })
      await page.waitForFunction(() => document.querySelectorAll('main canvas').length >= 5, null, { timeout: 30000 })
      await page.waitForTimeout(600)
      await page.screenshot({ path: `out/screens/accueil-${name}.png`, fullPage: true })
      await page.goto(`${BASE}/#/editeur`)
      await page.waitForSelector('canvas', { state: 'attached', timeout: 20000 })
      await page.waitForTimeout(1500)
      if (size === 'mobile') {
        await page.screenshot({ path: `out/screens/editeur-${name}.png` })
        await page.getByRole('tab').nth(1).click()
        await page.waitForTimeout(1500)
        await page.screenshot({ path: `out/screens/apercu-${name}.png` })
      } else {
        await page.screenshot({ path: `out/screens/editeur-${name}.png` })
      }
      await ctx.close()
    }
  }
}
await browser.close()
