import { expect, test } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1366, height: 768 } })

for (const hash of ['#/editeur', '#/lettre']) {
  test(`${hash} : la page ne défile jamais, seuls les panneaux défilent`, async ({ page }) => {
    await page.goto(`/${hash}`)
    await page.mouse.move(200, 400)
    await page.mouse.wheel(0, 3000)
    await page.mouse.move(900, 400)
    await page.mouse.wheel(0, 3000)
    const [sh, ih] = await page.evaluate(() => [document.scrollingElement!.scrollHeight, innerHeight])
    expect(sh).toBeLessThanOrEqual(ih)
  })
}

test('modèle choisi sur l’accueil : le guidé s’ouvre à l’étape Identité', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Commencer avec ce modèle/ }).first().click()
  await expect(page.locator('#step-title')).toHaveText('Identité')
})
