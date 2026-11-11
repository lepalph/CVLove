import { expect, test, type Page } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 390, height: 800 } })

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

test('mentions légales : ouvertes depuis le pied de l’accueil (fr), titre et pas de débordement à 390 px', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('contentinfo').getByRole('link', { name: 'Mentions légales' }).click()
  await expect(page).toHaveURL(/#\/mentions$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Mentions légales et confidentialité' })).toBeVisible()
  await expect(page.getByText('Vercel Inc., 440 N Barranca Avenue')).toBeVisible()
  await expect(page.getByText('[À REMPLACER]').first()).toBeVisible()
  expect(await noOverflow(page)).toBe(true)
})

test('mentions légales : en arabe, depuis le pied de l’éditeur, RTL, pas de débordement à 390 px', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('cvlove:v2', JSON.stringify({ state: { documents: [], activeId: '', uiLang: 'ar' }, version: 0 })))
  await page.goto('/#/editeur')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  expect(await noOverflow(page)).toBe(true) // le pied de l'éditeur avec le nouveau lien
  await page.getByRole('contentinfo').getByRole('link', { name: 'الإشعار القانوني' }).click()
  await expect(page).toHaveURL(/#\/mentions$/)
  await expect(page.getByRole('heading', { level: 1, name: 'الإشعار القانوني والخصوصية' })).toBeVisible()
  expect(await noOverflow(page)).toBe(true)
})
