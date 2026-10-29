import { expect, test, type Page } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1366, height: 768 } })

/** Crée un CV rempli (nom saisi en mode complet) puis revient à l'accueil. */
const fillCV = async (page: Page, first = 'Zoé') => {
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByLabel('Prénom').fill(first)
  await page.waitForTimeout(400)
}

/** Crée une lettre depuis Mes documents ; l'éditeur de lettre s'ouvre. */
const newLetter = async (page: Page) => {
  await page.goto('/#/documents')
  await page.getByRole('button', { name: 'Nouvelle lettre' }).click()
  await page.locator('form').getByRole('button', { name: /Créer/ }).click()
  await expect(page).toHaveURL(/#\/lettre/)
}

const importJson = (page: Page, docs: unknown[]) =>
  page.locator('input[type=file][accept^="application/json"]').setInputFiles({
    name: 'x.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'cvlove', version: 2, documents: docs })),
  })

test('titre de page par route et par langue', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Créer mon CV · CVLove')
  await page.goto('/#/documents')
  await expect(page).toHaveTitle('Mes documents · CVLove')
  await page.goto('/#/editeur')
  await expect(page).toHaveTitle('Éditeur de CV · CVLove')
  await newLetter(page)
  await expect(page).toHaveTitle('Lettre de motivation · CVLove')
  await page.getByLabel('Langue de l’interface').selectOption('en')
  await expect(page).toHaveTitle('Cover letter · CVLove')
})

test('changement de page : le focus va au titre principal ; un h1 dans l’éditeur et la lettre', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await expect(page.locator('h1')).toBeFocused()
  await page.goto('/#/editeur')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await newLetter(page)
  await expect(page.getByRole('heading', { level: 1, name: 'Lettre de motivation' })).toHaveCount(1)
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('bascule Modifier / Aperçu : deux boutons aria-pressed dans un groupe nommé', async ({ page }) => {
    await page.goto('/#/editeur')
    const group = page.getByRole('group', { name: 'Affichage' })
    await expect(group.getByRole('button', { name: 'Modifier' })).toHaveAttribute('aria-pressed', 'true')
    await group.getByRole('button', { name: 'Aperçu' }).click()
    await expect(group.getByRole('button', { name: 'Aperçu' })).toHaveAttribute('aria-pressed', 'true')
    await expect(group.getByRole('button', { name: 'Modifier' })).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByRole('tab')).toHaveCount(0)
  })
})

test('accueil : « Reprendre mon CV » seulement si un CV existe, sans débordement en 820 px', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Reprendre mon CV')).toHaveCount(0)
  await fillCV(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Reprendre mon CV' })).toBeVisible()
  await expect(page.getByText('Zoé, modifié le')).toBeVisible()
  await expect(page.getByText('Il est enregistré dans ce navigateur, sur cet appareil.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Créer mon CV' }).first()).toBeVisible()
  await page.setViewportSize({ width: 820, height: 1180 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  await page.getByRole('link', { name: 'Reprendre' }).click()
  await expect(page).toHaveURL(/#\/editeur/)
})

test('Mes documents : focus rendu après Renommer, annonce après Dupliquer', async ({ page }) => {
  await page.goto('/#/documents')
  const row = page.locator('li[data-doc]').first()
  const rename = row.getByRole('button', { name: /^Renommer/ })
  await rename.click()
  await page.getByLabel('Nom du document').fill('Mon CV')
  await page.keyboard.press('Enter')
  await expect(page.locator('li[data-doc="Mon CV"]').getByRole('button', { name: /^Renommer/ })).toBeFocused()
  await page.locator('li[data-doc="Mon CV"]').getByRole('button', { name: /^Renommer/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('li[data-doc="Mon CV"]').getByRole('button', { name: /^Renommer/ })).toBeFocused()
  await page.locator('li[data-doc="Mon CV"]').getByRole('button', { name: /^Dupliquer/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'dupliqué' })).toContainText('Mon CV')
})

test('import : le CV vide jamais modifié est retiré, le document importé devient actif ; pluriels', async ({ page }) => {
  await page.goto('/#/editeur')
  await page.goto('/#/documents')
  await expect(page.locator('li[data-doc]')).toHaveCount(1)
  const cv = (name: string) => ({
    id: name, kind: 'cv', name, updatedAt: 1, design: { templateId: 'classique-1', accent: '#c2410c' }, editorMode: 'full',
    data: { lang: 'fr', personal: { firstName: name, lastName: '', title: '', fields: [] }, sections: [] },
  })
  await importJson(page, [cv('Alice')])
  await expect(page.getByRole('status').filter({ hasText: 'importé' })).toHaveText('1 document importé.')
  await expect(page.locator('li[data-doc]')).toHaveCount(1)
  await expect(page.locator('li[data-doc]')).toContainText('En cours d’édition')
  await importJson(page, [cv('Bob'), cv('Carl')])
  await expect(page.getByRole('status').filter({ hasText: 'importé' })).toHaveText('2 documents importés.')
})

test.describe('en-GB', () => {
  test.use({ locale: 'en-GB' })
  test('dates au format du navigateur quand il correspond à la langue (jj/mm/aaaa)', async ({ page }) => {
    await page.goto('/#/documents')
    await page.getByLabel('Interface language').selectOption('en')
    await expect(page.locator('li[data-doc]').first()).toContainText(/Edited \d{2}\/\d{2}\/\d{4}/)
  })
})

test('étape Télécharger : « Tout effacer » est loin de « Télécharger le PDF »', async ({ page }) => {
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: /Télécharger|Download/ }).last().waitFor()
  await page.getByRole('navigation', { name: /Étapes/ }).first().getByRole('button').last().click()
  const dl = await page.locator('#step-title').boundingBox()
  expect(dl).not.toBeNull()
  const a = await page.getByRole('button', { name: 'Télécharger le PDF' }).last().boundingBox()
  const b = await page.getByRole('button', { name: 'Tout effacer' }).boundingBox()
  expect(b!.y - (a!.y + a!.height)).toBeGreaterThanOrEqual(24)
})
