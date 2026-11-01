import { expect, test, type Page } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 900 } })

const LONG = Array.from({ length: 70 }, (_, i) => `Mission ${i + 1} : suivi d’un chantier de bout en bout`).join('\n')

/** CV d'exemple dont la première zone de texte est assez longue pour remplir plus de deux pages. */
async function longCv(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Informatique' }).click()
  await page.locator('textarea.inp').first().fill(LONG)
}

const bar = (page: Page) => page.getByRole('group', { name: /\d+ pages/ })
const currentPage = (page: Page) => bar(page).locator('[aria-current="page"]')
const top = async (page: Page, n: number) => (await page.locator('.gap-4 canvas').nth(n).boundingBox())!.y

test('CV de 3 pages (bureau) : trois canvas, saut vers la page 3, page courante suivie au défilement, précédente/suivante', async ({ page }) => {
  await longCv(page)
  await expect(page.locator('.gap-4 canvas')).toHaveCount(3, { timeout: 30_000 })
  await expect(bar(page)).toBeVisible()
  await expect(currentPage(page)).toHaveAccessibleName('Page 1')

  await bar(page).getByRole('button', { name: 'Page 3', exact: true }).click()
  await expect(currentPage(page)).toHaveAccessibleName('Page 3')
  await expect.poll(async () => Math.abs((await top(page, 2)) - 130), { timeout: 5000 }).toBeLessThan(120) // la page 3 arrive en haut du panneau

  // défilement à la main vers le haut : la page courante revient à 1
  await page.locator('.gap-4 canvas').first().evaluate((c) => { let p = c.parentElement; while (p && getComputedStyle(p).overflowY !== 'auto') p = p.parentElement; p!.scrollTop = 0 })
  await expect(currentPage(page)).toHaveAccessibleName('Page 1')

  const prev = bar(page).getByRole('button', { name: 'Page précédente' })
  const next = bar(page).getByRole('button', { name: 'Page suivante' })
  await expect(prev).toBeDisabled()
  await next.click()
  await expect(currentPage(page)).toHaveAccessibleName('Page 2')
  await next.click()
  await expect(currentPage(page)).toHaveAccessibleName('Page 3')
  await expect(next).toBeDisabled()
  await prev.click()
  await expect(currentPage(page)).toHaveAccessibleName('Page 2')

  // clavier : Tab jusqu'à un numéro puis Entrée
  await bar(page).getByRole('button', { name: 'Page 1', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(currentPage(page)).toHaveAccessibleName('Page 1')
})

test('la frappe ne fait pas sauter l’aperçu : la page lue reste à sa place', async ({ page }) => {
  await longCv(page)
  await expect(page.locator('.gap-4 canvas')).toHaveCount(3, { timeout: 30_000 })
  await bar(page).getByRole('button', { name: 'Page 2', exact: true }).click()
  await expect(currentPage(page)).toHaveAccessibleName('Page 2')
  await page.waitForTimeout(800) // fin du défilement animé
  const before = await top(page, 1)
  const canvas = page.locator('.gap-4 canvas').nth(1)
  const handle = await canvas.elementHandle()
  await page.getByLabel('Prénom').fill('Camilla')
  await expect.poll(() => handle!.evaluate((c) => !c.isConnected), { timeout: 10_000 }).toBe(true) // le rendu a bien été remplacé
  await expect(page.locator('.gap-4 canvas')).toHaveCount(3)
  expect(Math.abs((await top(page, 1)) - before)).toBeLessThan(2)
  await expect(currentPage(page)).toHaveAccessibleName('Page 2')
})

test('mobile 390 px, onglet Aperçu : trois pages, saut vers la page 3', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await longCv(page)
  await page.getByRole('button', { name: 'Aperçu' }).first().click()
  await expect(page.locator('.gap-4 canvas')).toHaveCount(3, { timeout: 30_000 })
  await expect(bar(page)).toBeVisible()
  await bar(page).getByRole('button', { name: 'Page 3', exact: true }).click()
  await expect(currentPage(page)).toHaveAccessibleName('Page 3')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('lettre : plusieurs pages, barre et suivante', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Créer la lettre assortie' }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByLabel('Corps de la lettre').fill(Array.from({ length: 60 }, (_, i) => `Paragraphe ${i + 1} de ma motivation pour ce poste.`).join('\n\n'))
  await expect(page.locator('.gap-4 canvas').nth(1)).toBeAttached({ timeout: 30_000 })
  await expect(bar(page)).toBeVisible()
  await expect(currentPage(page)).toHaveAccessibleName('Page 1')
  await bar(page).getByRole('button', { name: 'Page suivante' }).click()
  await expect(currentPage(page)).toHaveAccessibleName('Page 2')
})
