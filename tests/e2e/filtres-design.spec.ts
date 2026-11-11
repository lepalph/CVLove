import { expect, test } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 1000 } })

test('éditeur : les filtres du catalogue sont repliés et la galerie démarre haut', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  const sum = page.locator('summary', { hasText: 'Design' })
  if (!(await sum.evaluate((s) => (s.parentElement as HTMLDetailsElement).open))) await sum.click()
  const group = page.getByRole('group', { name: 'Modèles' })
  const toggle = group.getByRole('button', { name: 'Filtres' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(group.getByRole('status')).toContainText(/\d+ sur \d+ modèles/)
  const first = await group.getByRole('list').boundingBox()
  const top = await group.boundingBox()
  expect(first!.y - top!.y).toBeLessThan(120)
  await toggle.click()
  await expect(group.getByRole('group', { name: 'Colonnes' })).toBeVisible()
  await group.getByRole('button', { name: '1 colonne' }).click()
  await expect(group.getByRole('button', { name: '1 colonne' })).toHaveAttribute('aria-pressed', 'true')
  await expect(group.getByRole('status')).not.toContainText(/^(\d+) sur \1 /)
})
