import { expect, test, type Page } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1366, height: 900 } })

/** Nouveau CV vide en mode complet. */
const openFull = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await expect(page).toHaveURL(/#\/editeur/)
  await page.getByRole('button', { name: 'Complet' }).click()
}

for (const [btn, first, who] of [['Vente et accueil', 'Nadia', 'Nadia Perrin'], ['Premier emploi', 'Lucas', 'Lucas Moreau'], ['Informatique', 'Camille', 'Camille Marchand']] as const) {
  test(`exemple « ${btn} » : remplit le CV et le bandeau cite ${who}`, async ({ page }) => {
    await openFull(page)
    await page.getByRole('button', { name: btn }).click()
    await expect(page.getByLabel('Prénom')).toHaveValue(first)
    await expect(page.getByText(`Ce document contient l’exemple de ${who}`)).toBeVisible()
  })
}

test('dates : un champ texte par date, Début / Fin, plus de listes', async ({ page }) => {
  await openFull(page)
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  const debut = page.getByLabel('Début', { exact: true }).first()
  await expect(debut).toHaveAttribute('placeholder', 'MM/AAAA')
  await debut.fill('mars 2020')
  await debut.blur()
  await expect(debut).toHaveValue('03/2020')
  await debut.fill('2020')
  await debut.blur()
  await expect(debut).toHaveValue('2020') // année seule : conservée
  await expect(page.locator('input[type=month]')).toHaveCount(0)
})

test('boutons de section et d’élément : nom accessible avec contexte', async ({ page }) => {
  await openFull(page)
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  await expect(page.getByRole('button', { name: 'Monter la section Expérience professionnelle' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Masquer la section Formation' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Supprimer : Vendeuse, Boulangerie Martin' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Masquer', exact: true })).toHaveCount(0)
})

test('champ personnalisé et niveaux des langues : libellés distincts', async ({ page }) => {
  await openFull(page)
  await page.getByRole('button', { name: /Champ libre/ }).click()
  await expect(page.getByLabel('Nom du champ').last()).toBeVisible() // le champ ajouté est le dernier
  await expect(page.getByLabel('Valeur', { exact: true }).last()).toBeVisible()
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  await expect(page.getByLabel('Niveau en toutes lettres').first()).toBeVisible()
  await expect(page.getByLabel('Niveau sur 5').first()).toBeVisible()
})

test('lettre assortie : trame dans le corps et exemple encore proposé', async ({ page }) => {
  await openFull(page)
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  await page.getByRole('button', { name: 'Créer la lettre assortie' }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  await expect(page.getByRole('group', { name: 'Remplir avec un exemple :' })).toBeVisible()
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByLabel('Corps de la lettre')).toHaveAttribute('placeholder', /Pourquoi cette entreprise/)
})
