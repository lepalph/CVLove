import { expect, test, type Page } from '@playwright/test'
import { extra } from '../../src/i18n/extra'
import { letterUi, letterLabels } from '../../src/i18n/letter'
import { ui } from '../../src/i18n/ui'

test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 900 } })

const newLetter = async (page: Page) => {
  await page.goto('/#/documents')
  await page.getByRole('button', { name: letterUi.fr.newLetter }).click()
  await page.locator('form').getByRole('button', { name: letterUi.fr.create }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  await page.getByRole('button', { name: 'Complet' }).click()
}
const setUi = (page: Page, l: 'fr' | 'en' | 'de') => page.getByLabel(ui[l].uiLang).first()

test('lettre vierge : elle prend la langue de l’interface, une lettre commencée garde la sienne', async ({ page }) => {
  await newLetter(page)
  await setUi(page, 'fr').selectOption('en')
  await expect(page.getByLabel(letterUi.en.salutation, { exact: true })).toHaveValue(letterLabels.en.salutation)
  await expect(page.getByLabel(letterUi.en.letterLang)).toHaveValue('en')
  await page.getByLabel(letterUi.en.subject, { exact: true }).fill('Application')
  await setUi(page, 'en').selectOption('de')
  await expect(page.getByLabel(letterUi.de.letterLang)).toHaveValue('en')
})

test('alerte « document vide » retraduite quand l’interface change (CV et lettre)', async ({ page }) => {
  await newLetter(page)
  await page.getByRole('banner').getByRole('button', { name: ui.fr.download }).click()
  await expect(page.getByRole('alert').filter({ hasText: extra.fr.emptyDownload })).toBeVisible()
  await setUi(page, 'fr').selectOption('de')
  await expect(page.getByRole('alert').filter({ hasText: extra.de.emptyDownload })).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(1)
})

test('aperçu d’exemple : annoncé aux lecteurs d’écran dans le nom de l’aperçu', async ({ page }) => {
  await newLetter(page)
  const img = page.locator('main [role=img]')
  await expect(img).toHaveAttribute('aria-label', new RegExp(extra.fr.samplePreview.slice(0, 20)))
  await page.getByLabel(letterUi.fr.subject, { exact: true }).fill('Candidature')
  await page.getByLabel(letterUi.fr.recName).fill('Mme Martin')
  await expect(img).not.toHaveAttribute('aria-label', new RegExp(extra.fr.samplePreview.slice(0, 20)))
})

test('échec du PDF : une seule alerte (téléchargement et aperçu ensemble)', async ({ page }) => {
  await page.route('**/assets/render-*.js', (r) => r.abort())
  await newLetter(page)
  await page.getByLabel(letterUi.fr.subject, { exact: true }).fill('Candidature')
  await page.getByLabel(letterUi.fr.recName).fill('Mme Martin')
  await expect(page.getByRole('alert').filter({ hasText: ui.fr.previewError })).toHaveCount(1) // l'aperçu échoue
  await page.getByRole('banner').getByRole('button', { name: ui.fr.download }).click()
  await expect(page.locator('.edalert')).toBeVisible()
  await expect(page.getByRole('alert').filter({ hasText: ui.fr.previewError })).toHaveCount(1)
})

test('allemand à 401 px : la barre de l’éditeur ne déborde pas', async ({ page }) => {
  await page.setViewportSize({ width: 401, height: 800 })
  await page.goto('/#/editeur')
  await page.locator('select').first().selectOption('de')
  await expect(page.locator('h1')).toHaveText(/Lebenslauf/)
  const over = await page.evaluate(() => [...document.querySelectorAll('header.edbar *')].filter((e) => {
    const r = e.getBoundingClientRect()
    return r.width > 1 && r.right > innerWidth + 0.5 && !e.closest('.sr-only') && !e.matches('.sr-only')
  }).length)
  expect(over).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(401)
})
