import { expect, test } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1366, height: 900 } })

test('CV rempli : le guidé s’ouvre à Identité (y compris via Reprendre)', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  await page.getByRole('button', { name: 'Enregistrer dans mon navigateur' }).click()
  await page.waitForTimeout(600)
  await page.goto('/')
  await page.getByRole('link', { name: /Reprendre|Continuer/ }).first().click()
  await page.getByRole('button', { name: 'Guidé' }).click()
  await expect(page.locator('#step-title')).toHaveText('Identité')
})

test('lettre : trois exemples au choix', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Créer la lettre assortie' }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  const g = page.getByRole('group', { name: 'Remplir avec un exemple :' })
  await expect(g.getByRole('button')).toHaveCount(3)
  await g.getByRole('button', { name: 'Informatique' }).click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByLabel('Corps de la lettre')).not.toHaveValue('')
})

test('Mes documents : Exporter (JSON) avec le nom du document', async ({ page }) => {
  await page.goto('/#/documents')
  await page.getByRole('button', { name: 'Nouveau CV' }).click()
  await page.goto('/#/documents')
  await expect(page.getByRole('button', { name: /^Exporter \(JSON\) : / }).first()).toBeVisible()
})

test('police : le select a un nom accessible', async ({ page }) => {
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByRole('combobox', { name: 'Police' })).toBeVisible()
})
