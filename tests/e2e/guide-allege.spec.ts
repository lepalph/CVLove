import { expect, test } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1366, height: 768 } })

test('guidé : l’étape Modèle montre 6 modèles, « Voir les 36 » ouvre le catalogue, le modèle choisi reste visible', async ({ page }) => {
  await page.goto('/#/editeur')
  const gallery = page.getByRole('group', { name: 'Modèles', exact: true })
  await expect(gallery.locator('ul > li')).toHaveCount(6)
  await page.getByRole('button', { name: 'Voir les 36 modèles' }).click()
  await expect(gallery.locator('ul > li')).toHaveCount(36)
  const last = gallery.locator('ul > li').last().getByRole('button')
  const name = (await last.getAttribute('aria-label'))!
  await last.click()
  // on quitte l'étape puis on y revient : le modèle choisi, hors des 6, s'ajoute à la liste courte
  await page.getByRole('button', { name: 'Suivant' }).click()
  await page.getByRole('button', { name: 'Précédent' }).click()
  await expect(gallery.locator('ul > li')).toHaveCount(7)
  await expect(gallery.getByRole('button', { name, pressed: true })).toBeVisible()
})

test('guidé : 8 étapes, la dernière réunit le design et le téléchargement', async ({ page }) => {
  await page.goto('/#/editeur')
  const bar = page.getByRole('navigation', { name: 'Étapes' })
  await expect(bar.getByRole('button')).toHaveCount(8)
  await bar.getByRole('button').last().click()
  await expect(page.locator('#step-title')).toHaveText('Design et téléchargement')
  const body = page.locator('section[aria-labelledby="step-title"]')
  await expect(body.getByRole('button', { name: 'Télécharger le PDF' })).toBeVisible()
  await expect(body.getByLabel('Police')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Suivant' })).toHaveCount(0)
})
