import { expect, test, type Page } from '@playwright/test'

// Réglages dans l'onglet Aperçu sur mobile (docs/wiki/reglages-apercu-mobile.md).
test.use({ locale: 'fr-FR', viewport: { width: 360, height: 740 }, hasTouch: true })

async function open(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Informatique' }).click()
  await page.getByRole('button', { name: 'Aperçu' }).first().click()
}

test('le tiroir de réglages : cibles de 44 px, effet direct, Échap et bouton ferment, focus rendu, rien ne déborde', async ({ page }) => {
  await open(page)
  const opener = page.getByRole('button', { name: 'Réglages', exact: true })
  await expect(opener).toBeVisible()
  await opener.click()
  const dlg = page.getByRole('dialog', { name: 'Réglages du CV' })
  await expect(dlg).toBeVisible()
  for (const c of [dlg.getByRole('combobox', { name: 'Modèle' }), dlg.getByRole('combobox', { name: 'Police' }), dlg.getByRole('slider'), dlg.getByRole('button', { name: 'Fermer' }), dlg.locator('button[aria-pressed=false]').first()]) {
    const b = (await c.boundingBox())!
    expect(b.height).toBeGreaterThanOrEqual(43.5)
  }
  const pressed = dlg.getByRole('button', { pressed: true })
  const other = dlg.locator('button[aria-pressed=false]').first()
  const name = await other.getAttribute('aria-label')
  await other.click()
  await expect(dlg.getByRole('button', { name: name!, pressed: true })).toBeVisible()
  expect(await pressed.count()).toBe(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const r = (await dlg.boundingBox())!
  expect(r.x).toBeGreaterThanOrEqual(0)
  expect(r.x + r.width).toBeLessThanOrEqual(360)
  // la feuille reste visible au-dessus du tiroir
  expect(r.y).toBeGreaterThan(740 * 0.4)

  await page.keyboard.press('Escape')
  await expect(dlg).toHaveCount(0)
  await expect(opener).toBeFocused()
  await opener.click()
  await dlg.getByRole('button', { name: 'Fermer' }).click()
  await expect(dlg).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('arabe : le tiroir suit le sens droite à gauche', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Informatique' }).click()
  await page.getByLabel('Langue de l’interface').first().selectOption('ar')
  await page.locator('.a-tabs button').last().click()
  const opener = page.getByRole('button', { name: 'الإعدادات', exact: true })
  await opener.click()
  const dlg = page.getByRole('dialog')
  await expect(dlg).toBeVisible()
  expect(await dlg.evaluate((e) => getComputedStyle(e).direction)).toBe('rtl')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('bureau : aucun bouton de réglages dans l’aperçu', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByRole('button', { name: 'Réglages', exact: true })).toHaveCount(0)
})
