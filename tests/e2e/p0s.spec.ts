import { expect, test, type Page } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 900 } })

const SAVED = 'Enregistré sur cet appareil'

async function open(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
}
const fill = async (page: Page) => {
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  if ((page.viewportSize()?.width ?? 0) >= 1024) await expect(page.locator('main [role=img] canvas').first()).toBeVisible({ timeout: 20_000 }) // mobile : aperçu dans l'autre onglet
  else await page.waitForTimeout(800)
}

test('témoin : absent pour un brouillon vierge, présent après écriture, une seule annonce', async ({ page }) => {
  await open(page)
  await page.waitForTimeout(1200)
  await expect(page.getByText(SAVED)).toHaveCount(0)
  await fill(page)
  await expect(page.getByText(SAVED)).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('cvlove:v2'))).toContain('documents')
  // la frappe ne le fait ni clignoter ni déplacer l'en-tête
  const h = (await page.locator('header.edbar').boundingBox())!.height
  await page.getByLabel('Prénom').fill('Camille')
  await expect(page.getByText(SAVED)).toBeVisible()
  expect((await page.locator('header.edbar').boundingBox())!.height).toBe(h)
})

test('témoin : retiré quand le stockage échoue, le bandeau prend le relais', async ({ page }) => {
  await open(page)
  await fill(page)
  await expect(page.getByText(SAVED)).toBeVisible()
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('plein', 'QuotaExceededError') } })
  await page.getByLabel('Prénom').fill('Zoé')
  await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 5000 })
  await expect(page.getByText(SAVED)).toHaveCount(0)
})

test('témoin dans la lettre', async ({ page }) => {
  await open(page)
  await fill(page)
  await page.getByRole('button', { name: 'Créer la lettre assortie' }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  await expect(page.getByText(SAVED)).toBeVisible()
})

test('après un PDF, l’export JSON n’attend pas la fin de la note', async ({ page }) => {
  await open(page)
  await fill(page)
  const t0 = Date.now()
  const dl = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Télécharger' }).first().click()
  await dl
  await page.getByText(/^PDF enregistré/).waitFor()
  await page.getByText('Fichier', { exact: true }).click()
  const json = page.waitForEvent('download', { timeout: 2000 })
  await page.getByRole('button', { name: 'Exporter (JSON)' }).click({ timeout: 2000 })
  expect((await json).suggestedFilename()).toMatch(/\.json$/)
  expect(Date.now() - t0).toBeLessThan(6000)
})

test('replier une section ne relance aucun rendu PDF', async ({ page }) => {
  await open(page)
  await fill(page)
  await page.waitForTimeout(2500) // laisse finir les rendus déclenchés par le chargement de l'exemple
  const canvas = page.locator('main [role=img] canvas').first()
  await canvas.evaluate((c) => { (c as HTMLCanvasElement & { mark?: boolean }).mark = true })
  await page.getByRole('button', { name: /^Replier la section/ }).first().click()
  await page.getByRole('button', { name: 'Tout déplier' }).click() // un seul bouton global : « Tout déplier » dès qu'une section est repliée
  await page.getByRole('button', { name: 'Tout replier' }).click()
  await page.waitForTimeout(1500) // debounce 300 ms + rendu : largement dépassés
  expect(await page.locator('main [role=img] canvas').first().evaluate((c) => (c as HTMLCanvasElement & { mark?: boolean }).mark === true)).toBe(true)
  // témoin positif : une vraie modification remplace bien les canvas
  await page.getByLabel('Prénom').fill('Alix')
  await expect.poll(() => page.locator('main [role=img] canvas').first().evaluate((c) => (c as HTMLCanvasElement & { mark?: boolean }).mark === true), { timeout: 20_000 }).toBe(false)
})

test('390 px : le témoin ne bouge pas la mise en page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page)
  await fill(page)
  await expect(page.getByText(SAVED)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
