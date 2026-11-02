// Annuler une suppression : bandeau 8 s, un seul, région live, focus rendu, Ctrl+Z hors champ de texte.
import { expect, test, type Page } from '@playwright/test'
import { guide } from '../../src/i18n/guide'
import { undoText } from '../../src/i18n/undo'
import { ui } from '../../src/i18n/ui'

const configs = [
  { name: 'bureau', lang: 'fr', viewport: { width: 1440, height: 900 } },
  { name: 'mobile 390', lang: 'fr', viewport: { width: 390, height: 844 } },
  { name: 'arabe', lang: 'ar', viewport: { width: 1440, height: 900 } },
] as const

for (const c of configs) {
  test.describe(c.name, () => {
    test.use({ locale: c.lang, viewport: c.viewport, hasTouch: c.name.startsWith('mobile') })
    const t = ui[c.lang]
    const u = undoText[c.lang]
    const banner = (page: Page) => page.getByRole('status').filter({ has: page.getByRole('button', { name: u.undo, exact: true }) })
    const sections = (page: Page) => page.locator('h3[tabindex="-1"]')
    const removeIn = (page: Page, h3: number) => sections(page).nth(h3).locator('xpath=ancestor::li[1]').getByRole('button', { name: new RegExp(`^${t.remove}`) }).first()
    const title = async (page: Page, i: number) => (await sections(page).nth(i).innerText()).trim()
    const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('cvlove:v2') ?? '{"state":{"documents":[]}}').state.documents.find((d: { kind: string }) => d.kind === 'cv')?.data.sections.length)

    async function open(page: Page) {
      await page.goto('/#/editeur')
      await page.getByRole('button', { name: guide[c.lang].full, exact: true }).click()
      await page.getByRole('button', { name: t.samples.dev }).click()
      await expect(sections(page).first()).toBeVisible()
    }

    test('supprimer une section : bandeau, annonce, ne masque rien, Annuler rétablit à la même place avec le focus', async ({ page }) => {
      await open(page)
      const n = await sections(page).count()
      const second = await title(page, 1)
      await removeIn(page, 1).click()
      await expect(sections(page)).toHaveCount(n - 1)
      const b = banner(page)
      await expect(b).toContainText(u.deleted.replace('{x}', second))
      // le bandeau ne recouvre ni l'en-tête (barre d'actions) ni, sur bureau, l'aperçu
      const bb = (await b.getByRole('button', { name: u.undo }).boundingBox())!
      const head = (await page.locator('header').first().boundingBox())!
      expect(bb.y).toBeGreaterThan(head.y + head.height)
      if (c.viewport.width > 1000) {
        const prev = (await page.locator('main > div').nth(1).boundingBox())!
        const wide = (await b.locator('> div').boundingBox())!
        const [lo, hi] = [Math.min(wide.x, wide.x + wide.width), Math.max(wide.x, wide.x + wide.width)]
        expect(hi <= prev.x + 1 || lo >= prev.x + prev.width - 1).toBe(true)
      }
      await b.getByRole('button', { name: u.undo }).click()
      await expect(sections(page)).toHaveCount(n)
      expect(await title(page, 1)).toBe(second)
      await expect(sections(page).nth(1)).toBeFocused()
      await expect(b.getByRole('button')).toHaveCount(0)
      await expect.poll(() => stored(page)).toBe(n) // l'enregistrement automatique suit
    })

    test('une seule instance : la nouvelle suppression remplace le bandeau', async ({ page }) => {
      await open(page)
      const n = await sections(page).count()
      const [a, z] = [await title(page, 0), await title(page, 1)]
      await removeIn(page, 0).click()
      await removeIn(page, 0).click() // l'ancienne deuxième est devenue première
      await expect(page.getByRole('button', { name: u.undo, exact: true })).toHaveCount(1)
      await expect(banner(page)).toContainText(u.deleted.replace('{x}', z))
      await page.getByRole('button', { name: u.undo, exact: true }).click()
      await expect(sections(page)).toHaveCount(n - 1) // seule la dernière est rétablie : pas d'historique
      expect(await title(page, 0)).toBe(z)
      expect(a).not.toBe(z)
    })

    test('Ctrl+Z hors champ annule ; dans un champ de texte il garde son effet natif', async ({ page }) => {
      await open(page)
      const n = await sections(page).count()
      await removeIn(page, 0).click()
      await expect(sections(page)).toHaveCount(n - 1)
      // le focus est sur un champ voisin : Ctrl+Z n'annule pas la suppression
      await page.locator('input.inp').first().focus()
      await page.keyboard.press('Control+z')
      await expect(sections(page)).toHaveCount(n - 1)
      await page.locator('input.inp').first().blur()
      await page.keyboard.press('Control+z')
      await expect(sections(page)).toHaveCount(n)
      await page.keyboard.press('Control+z') // rien à annuler : sans effet
      await expect(sections(page)).toHaveCount(n)
    })

    test('entrée et champ personnalisé : même mécanique', async ({ page }) => {
      await open(page)
      const items = page.locator('li[data-rid] li[data-rid]').filter({ has: page.getByRole('button', { name: new RegExp(`^${t.remove}`) }) }) // le profil n'a pas de ×
      const k = await items.count()
      await items.first().getByRole('button', { name: new RegExp(`^${t.remove}`) }).click()
      await expect(items).toHaveCount(k - 1)
      await expect(banner(page).getByRole('button', { name: u.undo })).toBeVisible()
      await banner(page).getByRole('button', { name: u.undo }).click()
      await expect(items).toHaveCount(k)
      const fields = page.locator('ul > li[data-rid]:has(input[type=email])')
      await fields.getByRole('button', { name: new RegExp(`^${t.remove}`) }).click()
      await expect(fields).toHaveCount(0)
      await banner(page).getByRole('button', { name: u.undo }).click()
      await expect(fields).toHaveCount(1)
      await expect(fields.locator('input')).toBeFocused()
    })

    test('le bandeau disparaît après 8 s', async ({ page }) => {
      await open(page)
      await removeIn(page, 0).click()
      await expect(banner(page).getByRole('button')).toBeVisible()
      await expect(banner(page).getByRole('button')).toHaveCount(0, { timeout: 10_000 })
    })
  })
}
