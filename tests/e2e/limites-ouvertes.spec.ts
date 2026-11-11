// Limites ouvertes (2026-11-11) : pause du bandeau Annuler, Ctrl+Z après un ×, brouillon de date périmé, replier sans changer la date du document.
import { expect, test, type Page } from '@playwright/test'
import { undoText } from '../../src/i18n/undo'
import { ui } from '../../src/i18n/ui'

const t = ui.fr
const u = undoText.fr
const sections = (page: Page) => page.locator('h3[tabindex="-1"]')
const undoBtn = (page: Page) => page.getByRole('button', { name: u.undo, exact: true })
const doc = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('cvlove:v2') ?? '{"state":{"documents":[]}}').state.documents.find((d: { kind: string }) => d.kind === 'cv'))
const frames = (page: Page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
async function open(page: Page) {
  await page.clock.install()
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet', exact: true }).click()
  await page.getByRole('button', { name: t.samples.dev }).click()
  await expect(sections(page).first()).toBeVisible()
}
const removeFirst = (page: Page) => sections(page).first().locator('xpath=ancestor::li[1]').getByRole('button', { name: new RegExp(`^${t.remove}${t.onSection.split('{x}')[0]}`) }).last().click()

test('le délai de 8 s se suspend au survol puis repart', async ({ page }) => {
  await open(page)
  await removeFirst(page)
  await undoBtn(page).hover()
  await page.clock.fastForward(20_000)
  await expect(undoBtn(page)).toBeVisible()
  await page.mouse.move(5, 5)
  await page.clock.fastForward(7_000)
  await expect(undoBtn(page)).toBeVisible()
  await page.clock.fastForward(2_000)
  await expect(undoBtn(page)).toHaveCount(0)
})

test('le délai de 8 s se suspend tant que le focus est dans le bandeau', async ({ page }) => {
  await open(page)
  await removeFirst(page)
  await frames(page)
  await undoBtn(page).focus()
  await page.clock.fastForward(20_000)
  await expect(undoBtn(page)).toBeVisible()
  await undoBtn(page).blur()
  await page.clock.fastForward(9_000)
  await expect(undoBtn(page)).toHaveCount(0)
})

test('Ctrl+Z dans un champ resté vierge annule la suppression ; dans un champ déjà saisi il reste natif', async ({ page }) => {
  await open(page)
  const inputs = page.locator('input.inp')
  await inputs.nth(1).fill('Zed') // ce champ a une histoire native
  const n = await sections(page).count()
  await removeFirst(page)
  await expect(sections(page)).toHaveCount(n - 1)
  await frames(page)
  await inputs.nth(1).focus()
  await page.keyboard.press('Control+z')
  await expect(sections(page)).toHaveCount(n - 1)
  await inputs.nth(2).focus() // jamais saisi : rien à annuler en natif
  await page.keyboard.press('Control+z')
  await expect(sections(page)).toHaveCount(n)
})

test('un brouillon de date invalide disparaît quand la valeur change ailleurs (autre onglet)', async ({ context, page }) => {
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet', exact: true }).click()
  await page.getByRole('button', { name: t.samples.dev }).click()
  const start = page.getByLabel(t.start, { exact: true }).first()
  await start.fill('13/45')
  await start.blur()
  await expect(start).toHaveAttribute('aria-invalid', 'true')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cvlove:v2')?.includes('Camille'))).toBe(true) // l'exemple est écrit (après 500 ms de calme) avant d'ouvrir l'autre onglet
  const other = await context.newPage()
  await other.goto('/#/editeur')
  await other.getByRole('button', { name: 'Complet', exact: true }).click()
  const s2 = other.getByLabel(t.start, { exact: true }).first()
  await s2.fill('05/2005')
  await s2.blur()
  await expect.poll(async () => (await other.evaluate(() => localStorage.getItem('cvlove:v2')))?.includes('"start":"2005-05"')).toBe(true)
  await expect(start).toHaveValue('05/2005')
  await expect(start).not.toHaveAttribute('aria-invalid', 'true')
})

test('replier une section ne change pas la date de modification ; modifier la change', async ({ page }) => {
  await open(page)
  await page.clock.fastForward(1_000)
  const before = (await doc(page)).updatedAt
  const first = (await sections(page).first().innerText()).trim()
  await page.getByRole('button', { name: new RegExp(`^Replier la section ${first}`) }).click()
  await expect.poll(async () => (await doc(page)).data.sections[0].collapsed).toBe(true)
  expect((await doc(page)).updatedAt).toBe(before)
  await page.clock.fastForward(1_000)
  await page.locator('input.inp').first().fill('Zed')
  await expect.poll(async () => (await doc(page)).updatedAt).toBeGreaterThan(before)
})
