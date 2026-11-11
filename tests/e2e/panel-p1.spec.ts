import { expect, test, type Page } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 1700 }, hasTouch: true })

const handle = (page: Page, n: number, name = /^Glisser pour déplacer/) => page.getByRole('button', { name }).nth(n)
const stored = (page: Page) => page.evaluate(() => Object.values(localStorage).join(''))
const count = (s: string) => s.split('"collapsed":true').length - 1

async function openFull(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  await expect(handle(page, 0)).toBeVisible()
}

test('glisser : les sections se replient, puis retrouvent leur état au lâcher (état enregistré intact)', async ({ page }) => {
  await openFull(page)
  await page.getByRole('button', { name: /^Replier la section/ }).nth(1).click() // la 2e est repliée avant le glisser
  await page.waitForTimeout(700)
  const before = count(await stored(page))
  expect(before).toBe(1)
  const field = page.getByLabel('Titre de la section')
  const n = await field.count()
  await expect(field.locator('visible=true')).toHaveCount(n - 1)
  await handle(page, 0).evaluate((el) => el.scrollIntoView({ block: 'center' })) // pas sous le sommaire collant
  const b = (await handle(page, 0).boundingBox())!
  await page.mouse.move(b.x + 20, b.y + 20)
  await page.mouse.down()
  await page.mouse.move(b.x + 20, b.y + 60, { steps: 3 })
  await expect(field.locator('visible=true')).toHaveCount(0) // tout est replié pendant le glisser
  await page.waitForTimeout(700)
  expect(count(await stored(page))).toBe(before) // sans toucher à l'état enregistré
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(field.locator('visible=true')).toHaveCount(n - 1) // chacune retrouve son état
  await expect(page.getByRole('button', { name: /^Déplier la section/ })).toHaveCount(1)
  expect(count(await stored(page))).toBe(before)
})

test('guidé : étape à une section sans barre d’actions superflue ; étape à deux sections garde le rangement', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  await page.getByRole('button', { name: 'Expérience', exact: true }).click()
  await expect(page.locator('#step-title')).toHaveText('Expérience')
  await expect(page.getByRole('button', { name: /^Masquer la section/ })).toHaveCount(1)
  await expect(page.getByRole('button', { name: /^Supprimer la section/ })).toHaveCount(1)
  for (const re of [/^Monter la section/, /^Descendre la section/, /^Glisser pour déplacer/, /^Replier la section/]) await expect(page.getByRole('button', { name: re })).toHaveCount(0)
  await page.getByRole('button', { name: 'Compétences et langues', exact: true }).click()
  await expect(page.locator('#step-title')).toHaveText('Compétences et langues')
  await expect(page.getByRole('button', { name: /^Monter la section/ })).toHaveCount(2)
  await expect(page.getByRole('button', { name: /^Glisser pour déplacer/ })).toHaveCount(2)
  await expect(page.getByRole('button', { name: /^Replier la section/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Tout replier' })).toHaveCount(0)
})

test('sommaire collant : un clic mène à la section ; caché sur mobile', async ({ page }) => {
  await openFull(page)
  const toc = page.getByRole('navigation', { name: 'Aller à une section' })
  await expect(toc).toBeVisible()
  const last = toc.getByRole('button').last()
  const name = (await last.textContent())!.trim()
  await last.click()
  const h = page.getByRole('heading', { level: 3, name })
  await expect(h).toBeFocused()
  const pane = page.locator('div.overflow-y-auto').first()
  await expect.poll(() => pane.evaluate((e) => e.scrollTop)).toBeGreaterThan(200) // défilement doux : attendre qu'il soit fini
  await page.waitForTimeout(400)
  const tb = (await toc.boundingBox())!, hb = (await h.boundingBox())!
  expect(hb.y).toBeGreaterThanOrEqual(tb.y + tb.height - 1) // pas sous le sommaire
  await expect(toc).toBeVisible() // collant
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(toc).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('sommaire en arabe (RTL)', async ({ page }) => {
  await openFull(page)
  await page.getByLabel(/Langue de l.interface/).selectOption('ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  const toc = page.locator('nav[data-toc]')
  await expect(toc).toBeVisible()
  expect(await toc.getByRole('button').count()).toBeGreaterThan(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
