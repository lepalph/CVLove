import { expect, test, type Page } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 1000 } })

const LINES = (n: number) => Array.from({ length: n }, (_, i) => `Mission ${i + 1} : suivi d’un chantier de bout en bout`).join('\n')

async function start(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Informatique' }).click()
  const sum = page.locator('summary', { hasText: 'Design' })
  if (!(await sum.evaluate((s) => (s.parentElement as HTMLDetailsElement).open))) await sum.click()
}

const option = (page: Page) => page.getByRole('checkbox', { name: /Tenir sur 1 page/ })

test('« Tenir sur 1 page » : absente sur un CV d’une page, proposée dès qu’il déborde, retire une page, reste cochée pour la ramener', async ({ page }) => {
  await start(page)
  await expect(page.locator('.gap-4 canvas')).toHaveCount(1, { timeout: 30_000 })
  await expect(option(page)).toHaveCount(0)

  await page.locator('textarea.inp').first().fill(LINES(14))
  await expect(option(page)).toBeVisible({ timeout: 30_000 })
  const before = await page.locator('.gap-4 canvas').count()
  expect(before).toBeGreaterThan(1)

  await option(page).check()
  await expect.poll(() => page.locator('.gap-4 canvas').count(), { timeout: 30_000 }).toBeLessThan(before)
  // enregistrée dans le design du document ; si le CV tient désormais sur 1 page, l'option reste là pour être décochée
  await page.waitForTimeout(1000)
  await page.reload()
  await expect(option(page)).toBeChecked({ timeout: 30_000 })
  await option(page).uncheck()
  await expect.poll(() => page.locator('.gap-4 canvas').count(), { timeout: 30_000 }).toBe(before)
})
