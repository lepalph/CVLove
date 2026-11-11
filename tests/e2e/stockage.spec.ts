import { expect, test } from '@playwright/test'

type W = { asked: number }

test('Mes documents vide : dit quoi faire', async ({ page }) => {
  await page.goto('/#/documents')
  await expect(page.getByText('Aucun document pour l’instant')).toBeVisible()
})

test('un exemple chargé est marqué « Exemple », et le stockage durable est demandé une seule fois (refus sans conséquence)', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as unknown as W).asked = 0
    Object.defineProperty(navigator, 'storage', { value: { persist: () => { (window as unknown as W).asked++; return Promise.reject(new Error('refusé')) } } })
  })
  await page.goto('/#/editeur')
  expect(await page.evaluate(() => (window as unknown as W).asked)).toBe(0) // rien d'enregistré : pas de demande
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Remplir avec l’exemple' }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as W).asked)).toBe(1)
  await page.getByLabel('Prénom').fill('Zoé')
  await page.waitForTimeout(800) // second enregistrement
  expect(await page.evaluate(() => (window as unknown as W).asked)).toBe(1)
  await page.getByLabel('Prénom').fill('')
  await page.getByLabel('Prénom').fill('Camille')
  await page.goto('/#/documents')
})

test('Mes documents : le plus récent en premier, « Lettre » traduit dans la langue de l’interface', async ({ page }) => {
  await page.goto('/#/documents')
  for (const prenom of ['Alice', 'Bruno']) {
    await page.getByRole('button', { name: 'Nouveau CV' }).click()
    await page.getByRole('button', { name: 'Complet' }).click()
    await page.getByLabel('Prénom').fill(prenom)
    await page.waitForTimeout(700)
    await page.goto('/#/documents')
  }
  await expect(page.locator('li[data-doc]').first()).toContainText('Bruno')
  await page.getByRole('button', { name: 'Lettre', exact: false }).first().click()
  await page.getByRole('button', { name: 'Créer' }).click()
  await page.goto('/#/documents')
  await page.getByLabel(/Langue de l.interface/).selectOption('en')
  await expect(page.locator('li[data-doc="Lettre"]')).toContainText('Letter')
  await expect(page.locator('li[data-doc="Lettre"]')).not.toContainText('Lettre ·')
})
