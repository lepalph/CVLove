import { expect, test, type Page } from '@playwright/test'

test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 1700 }, hasTouch: true })

const titles = (page: Page) => page.locator('h3[tabindex="-1"]').allTextContents().then((a) => a.map((t) => t.trim()))
const handle = (page: Page, n: number, name = /^Glisser pour déplacer/) => page.getByRole('button', { name }).nth(n)

async function open(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Vente et accueil' }).click()
  await expect(handle(page, 0)).toBeVisible()
}

/** Glisse la poignée n vers le milieu de la section cible (souris, ou toucher via CDP : vrais pointer events pointerType=touch). */
async function dragTo(page: Page, from: number, to: number, how: 'mouse' | 'touch', name?: RegExp) {
  await handle(page, from, name).evaluate((el) => el.scrollIntoView({ block: 'start' }))
  const b = (await handle(page, from, name).boundingBox())!
  // viser le bas de la section cible (début de la suivante) : il faut dépasser le milieu de la section survolée
  const target = (await page.locator('h3[tabindex="-1"]').nth(to + 1).boundingBox())!
  const x = b.x + b.width / 2, y0 = b.y + b.height / 2
  const y1 = to > from ? target.y - 5 : (await page.locator('h3[tabindex="-1"]').nth(to).boundingBox())!.y - 10
  if (how === 'mouse') {
    await page.mouse.move(x, y0)
    await page.mouse.down()
    await page.mouse.move(x, (y0 + y1) / 2, { steps: 5 })
    await page.mouse.move(x, y1, { steps: 5 })
    await expect(page.locator('[aria-hidden=true].bg-ink')).toBeVisible() // barre d'insertion pendant le glisser
    await page.mouse.up()
    return
  }
  const cdp = await page.context().newCDPSession(page)
  const touch = (type: string, y: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
  await touch('touchStart', y0)
  for (let k = 1; k <= 8; k++) await touch('touchMove', y0 + ((y1 - y0) * k) / 8)
  await touch('touchEnd', y1)
}

test('glisser à la souris : une section change de rang et c’est annoncé', async ({ page }) => {
  await open(page)
  const before = await titles(page)
  await dragTo(page, 0, 2, 'mouse')
  const after = await titles(page)
  expect(after).toEqual([before[1], before[2], before[0], ...before.slice(3)])
  await expect(page.getByRole('status').filter({ hasText: 'déplacée en position 3 sur' })).toContainText(before[0])
})

test('glisser au toucher', async ({ page }) => {
  await open(page)
  const before = await titles(page)
  await dragTo(page, 0, 1, 'touch')
  expect(await titles(page)).toEqual([before[1], before[0], ...before.slice(2)])
})

test('Échap annule le glisser', async ({ page }) => {
  await open(page)
  const before = await titles(page)
  await handle(page, 0).evaluate((el) => el.scrollIntoView({ block: 'start' }))
  const b = (await handle(page, 0).boundingBox())!
  await page.mouse.move(b.x + 20, b.y + 20)
  await page.mouse.down()
  await page.mouse.move(b.x + 20, b.y + 400, { steps: 6 })
  await page.keyboard.press('Escape')
  await page.mouse.up()
  expect(await titles(page)).toEqual(before)
})

test('clavier : ↑ ↓ déplacent toujours la section', async ({ page }) => {
  await open(page)
  const before = await titles(page)
  const down = page.getByRole('button', { name: `Descendre la section ${before[0]}` })
  await down.focus()
  await page.keyboard.press('Enter')
  expect(await titles(page)).toEqual([before[1], before[0], ...before.slice(2)])
  await page.getByRole('button', { name: `Monter la section ${before[0]}` }).click()
  expect(await titles(page)).toEqual(before)
})

test('replier, tout replier, état gardé après rechargement', async ({ page }) => {
  await open(page)
  const [first] = await titles(page)
  const chev = page.getByRole('button', { name: `Replier la section ${first}` })
  await chev.focus()
  await page.keyboard.press('Enter')
  const open1 = page.getByRole('button', { name: `Déplier la section ${first}` })
  await expect(open1).toHaveAttribute('aria-expanded', 'false')
  await expect(open1).toBeFocused()
  await expect(page.getByLabel('Titre de la section').first()).toBeHidden()
  await page.getByRole('button', { name: 'Tout déplier' }).click()
  await expect(page.getByRole('button', { name: /^Replier la section/ })).toHaveCount((await titles(page)).length)
  await page.getByRole('button', { name: 'Tout replier' }).click()
  await expect(page.getByRole('button', { name: /^Déplier la section/ })).toHaveCount((await titles(page)).length)
  await expect(page.getByText(/\d+ expériences? · /)).toBeVisible() // résumé d'une ligne
  await page.waitForTimeout(700)
  await page.reload()
  await expect(page.getByRole('button', { name: /^Déplier la section/ }).first()).toHaveAttribute('aria-expanded', 'false')
})

test('arabe (RTL) : poignée, repli et glisser fonctionnent', async ({ page }) => {
  await open(page)
  await page.getByLabel(/Langue de l.interface/).selectOption('ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  const h = page.getByRole('button', { name: /^اسحب للنقل/ })
  const before = await titles(page)
  await expect(h.first()).toBeVisible()
  await expect((await h.first().boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await h.first().evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await dragTo(page, 0, 1, 'mouse', /^اسحب للنقل/)
  expect(await titles(page)).toEqual([before[1], before[0], ...before.slice(2)])
  const c = page.locator('button[aria-expanded=true]').first()
  await c.click()
  await expect(page.locator('button[aria-expanded=false]')).toHaveCount(1)
})

test('mobile 390 px : pas de débordement horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('défilement automatique près du bord du panneau', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 })
  await open(page)
  await handle(page, 0).evaluate((el) => el.scrollIntoView({ block: 'start' }))
  const panel = page.locator('div.overflow-y-auto').first()
  const top0 = await panel.evaluate((e) => e.scrollTop)
  const b = (await handle(page, 0).boundingBox())!
  await page.mouse.move(b.x + 20, b.y + 20)
  await page.mouse.down()
  await page.mouse.move(b.x + 20, 690, { steps: 5 })
  await page.waitForTimeout(400)
  expect(await panel.evaluate((e) => e.scrollTop)).toBeGreaterThan(top0)
  await page.keyboard.press('Escape')
  await page.mouse.up()
})

test('modèle à deux colonnes : un déplacement que le PDF ne montre pas est expliqué sous la section', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Moderne · Bandeau' }).click()
  const t = await titles(page)
  const k = t.indexOf('Compétences')
  const note = page.locator('li p[aria-hidden=true]', { hasText: 'Avec ce modèle, la section Compétences reste dans sa colonne' })
  // Compétences (colonne latérale) passe au-dessus d'une section de la colonne principale : le PDF ne bouge pas, on le dit
  expect(['Expérience professionnelle', 'Formation']).toContain(t[k - 1])
  await page.getByRole('button', { name: 'Monter la section Compétences' }).click()
  await expect(note).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'reste dans sa colonne' })).toHaveCount(1) // aussi annoncé
  // retour : elle repasse la même section de la colonne principale, la note reste
  await page.getByRole('button', { name: 'Descendre la section Compétences' }).click()
  await expect(note).toBeVisible()
  // modèle à une colonne : la note n'a plus d'objet
  await page.getByRole('button', { name: 'Classique · Académique' }).click()
  await expect(note).toHaveCount(0)
})
