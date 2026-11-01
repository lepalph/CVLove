import { expect, test } from '@playwright/test'

test('pied d’éditeur : compteur « 0 requête vers un autre site » mesuré en direct, avec son explication', async ({ page }) => {
  await page.goto('/#/editeur')
  const foot = page.getByRole('contentinfo')
  await expect(foot).toContainText('0 requête vers un autre site')
  await foot.getByText('Comment le vérifier').click()
  await expect(foot).toContainText('onglet Réseau')
})

test('barre d’étapes : « 01 Modèle » nommé, étape courante en entier, « faite » seulement si remplie', async ({ page }) => {
  await page.goto('/#/editeur')
  const bar = page.getByRole('navigation', { name: 'Étapes' })
  await expect(bar).toContainText('01')
  await expect(bar.getByRole('button', { name: 'Modèle', exact: true })).toHaveAttribute('aria-current', 'step')
  await bar.getByRole('button', { name: 'Compétences et langues' }).click()
  await expect(bar.getByRole('button', { name: 'Compétences et langues' })).toContainText('Compétences et langues') // nom complet de l'étape courante
  await expect(bar.getByRole('button', { name: 'Modèle', exact: true })).toContainText('Modèle')
  // Suivant sur une étape vide ne la coche pas
  await page.getByRole('button', { name: 'Complet' }).click()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Tout effacer' }).click()
  await page.getByRole('button', { name: 'Guidé' }).click()
  await bar.getByRole('button', { name: 'Profil', exact: true }).click()
  await page.getByRole('button', { name: 'Suivant' }).click()
  await expect(bar.getByRole('button', { name: 'Profil', exact: true })).toBeVisible() // pas « Profil (faite) »
})

test('document vide : champs vides avec placeholders d’exemple, aperçu nommé, annonces et focus conservé au téléchargement', async ({ page }) => {
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet' }).click()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Tout effacer' }).click()
  const prenom = page.getByLabel('Prénom')
  await expect(prenom).toHaveValue('')
  await expect(prenom).toHaveAttribute('placeholder', /.+/)
  await expect(page.getByRole('img', { name: /Aperçu du document/ })).toBeVisible()
  // annonce du modèle choisi
  await page.getByRole('button', { name: 'Minimal · Gouttière' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Modèle Minimal · Gouttière appliqué' })).toBeAttached()
  // le focus reste sur le bouton après le téléchargement
  const dl = page.getByRole('banner').getByRole('button', { name: 'Télécharger le PDF' })
  // document vide : pas de PDF blanc, un message à la place
  await dl.click()
  await expect(page.getByRole('alert').filter({ hasText: 'Votre document est vide' })).toBeVisible()
  await prenom.fill('Zoé')
  await dl.focus()
  const [d] = await Promise.all([page.waitForEvent('download'), dl.press('Enter')])
  expect(d.suggestedFilename()).toMatch(/^CV-.*\.pdf$/)
  await expect(dl).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: 'PDF téléchargé' })).toBeAttached()
})

test('vignettes au ratio A4 et grille de modèles à une seule tabulation', async ({ page }) => {
  await page.goto('/#/editeur')
  const first = page.getByRole('button', { name: /^Classique · / }).first()
  const box = await first.locator('div.relative').first().boundingBox()
  expect(box!.height / box!.width).toBeCloseTo(1.414, 2)
  const tabbable = await page.locator('main ul button[aria-pressed]').evaluateAll((bs) => bs.filter((b) => (b as HTMLElement).tabIndex === 0).length)
  expect(tabbable).toBe(1)
})

test('CV vide : l’aperçu montre l’exemple, signalé, jusqu’à la première saisie', async ({ page }) => {
  await page.goto('/#/editeur')
  const note = page.getByText('Exemple. Vos informations le remplacent dès que vous commencez à écrire.')
  await expect(note).toBeVisible()
  await expect(page.locator('main canvas').last()).toBeVisible()
  await page.getByRole('navigation', { name: 'Étapes' }).getByRole('button', { name: 'Identité', exact: true }).click()
  await page.getByLabel('Prénom').fill('Ralph')
  await expect(note).toBeHidden()
})
