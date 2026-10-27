// Captures de l'app dans out/screens/ (pnpm build && pnpm preview doivent tourner sur :4173).
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

mkdirSync('out/screens', { recursive: true })
const browser = await chromium.launch()
for (const [name, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]] as const) {
  for (const lang of ['fr', 'ar']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: lang, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => console.log('pageerror', e.message))
    page.on('console', (m) => m.type() === 'error' && console.log('console', m.text()))
    await page.goto('http://localhost:4173/')
    await page.waitForSelector('canvas', { state: 'attached', timeout: 20000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: `out/screens/galerie-${name}-${lang}.png` })
    await page.goto('http://localhost:4173/#/edit')
    await page.waitForSelector('canvas', { state: 'attached', timeout: 20000 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `out/screens/editeur-${name}-${lang}.png` })
    if (name === 'mobile') {
      await page.getByRole('tab').nth(1).click()
      await page.waitForTimeout(600)
      await page.screenshot({ path: `out/screens/apercu-${name}-${lang}.png` })
    }
    await ctx.close()
  }
}
await browser.close()
