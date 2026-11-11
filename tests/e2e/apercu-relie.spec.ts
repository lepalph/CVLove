import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Aperçu relié au formulaire (docs/wiki/apercu-relie.md) : un clic sur un bloc de l'aperçu met le focus sur son champ.
test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 1000 } })

async function open(page: Page, lang?: 'ar') {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  if (lang) await page.getByLabel('Langue du CV').first().selectOption(lang)
  await page.getByRole('button', { name: 'Informatique' }).click()
  await expect(page.getByLabel('Prénom')).not.toHaveValue('')
}

/** Lignes du PDF téléchargé (mêmes octets que l'aperçu), en fractions de la page : on vise le texte sans coordonnées en dur. */
async function lines(page: Page) {
  const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Télécharger le PDF' }).click()])
  const doc = await getDocument({ data: new Uint8Array(readFileSync((await d.path())!)), verbosity: 0 }).promise
  const out: { page: number; str: string; x: number; y: number }[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const pg = await doc.getPage(p)
    const { width, height } = pg.getViewport({ scale: 1 })
    for (const i of (await pg.getTextContent()).items as { str: string; transform: number[]; width: number; height: number }[])
      if (i.str.trim()) out.push({ page: p - 1, str: i.str, x: (i.transform[4] + i.width / 2) / width, y: (height - i.transform[5] - i.height / 3) / height })
  }
  return out
}

/** Pages de l'aperçu (la galerie des modèles a aussi des canvas, plus haut dans <main>). */
const sheet = (page: Page) => page.locator('main div[role=img]').last().locator('canvas')

/** Clique au milieu de la ligne qui contient `text` (la n-ième), une fois l'aperçu prêt. */
async function clickLine(page: Page, all: Awaited<ReturnType<typeof lines>>, text: string, nth = 0) {
  const l = all.filter((x) => x.str.includes(text))[nth]
  expect(l, `ligne « ${text} »`).toBeTruthy()
  await expect(page.getByText('Mise à jour de l’aperçu…')).toHaveCount(0)
  const c = sheet(page).nth(l.page)
  await c.scrollIntoViewIfNeeded()
  const b = (await c.boundingBox())!
  await page.mouse.click(b.x + l.x * b.width, b.y + l.y * b.height)
}

const focusedValue = (page: Page) => page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.value)

test('un clic sur le nom, un poste, un titre de section mène au champ ; section repliée dépliée', async ({ page }) => {
  await open(page)
  const all = await lines(page)
  await clickLine(page, all, 'Camille Marchand')
  await expect(page.getByLabel('Prénom')).toBeFocused()
  await clickLine(page, all, 'Développeuse front-end')
  await expect.poll(() => focusedValue(page)).toBe('Développeuse front-end')
  await clickLine(page, all, 'Studio Pivoine')
  await expect.poll(() => focusedValue(page)).toBe('Studio Pivoine')
  await clickLine(page, all, 'Formation') // titre de section : champ « Titre de la section » de Formation
  await expect(page.locator('li[data-rid]').filter({ has: page.getByRole('heading', { name: 'Formation' }) }).getByLabel('Titre de la section')).toBeFocused()

  await page.getByRole('button', { name: /^Replier la section Expérience/ }).click()
  await expect(page.getByRole('button', { name: /^Déplier la section Expérience/ })).toBeVisible()
  await clickLine(page, all, 'Encadrement de deux développeurs juniors')
  await expect(page.getByRole('button', { name: /^Replier la section Expérience/ })).toBeVisible()
  await expect(page.locator(':focus')).toBeVisible()
  await expect.poll(() => focusedValue(page)).toContain('Encadrement de deux développeurs juniors')

  // Survol : main et cadre sur une ligne reliée ; rien sur le blanc du bas de page, et un clic n'y mène à aucun champ.
  const hostOf = page.locator('main div[role=img]').last()
  const l = all.find((x) => x.str === 'Formation')!
  const c = (await sheet(page).nth(l.page).boundingBox())!
  await page.mouse.move(c.x + l.x * c.width, c.y + l.y * c.height)
  await expect(hostOf).toHaveClass(/cursor-pointer/)
  await expect(hostOf).toHaveAttribute('title', 'Modifier dans le formulaire')
  await page.mouse.move(c.x + c.width / 2, c.y + c.height - 8)
  await expect(hostOf).not.toHaveClass(/cursor-pointer/)
  await page.mouse.click(c.x + c.width / 2, c.y + c.height - 8)
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toMatch(/INPUT|TEXTAREA|SELECT/)
})

test('deux colonnes (Moderne) : la colonne latérale mène aussi au bon champ', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Moderne · Bandeau' }).click()
  await expect(page.getByRole('button', { name: 'Moderne · Bandeau', pressed: true })).toBeVisible()
  const all = await lines(page)
  await clickLine(page, all, 'Back-end')
  await expect.poll(() => focusedValue(page)).toBe('Back-end')
  await clickLine(page, all, 'Avancé', 1) // 2e « Avancé » : le niveau de la 3e compétence (Outils)
  const sel = page.locator('li[data-rid]:not(:has(li))').filter({ has: page.locator('input[value="Outils"]') }).getByRole('combobox')
  await expect(sel).toBeFocused()
  await clickLine(page, all, 'Licence Informatique')
  await expect.poll(() => focusedValue(page)).toBe('Licence Informatique')
})

test('arabe (RTL) : le clic retrouve le champ malgré l’ordre des lettres extraites', async ({ page }) => {
  await open(page, 'ar')
  const all = await lines(page)
  await clickLine(page, all, 'مطورة واجهات أمامية')
  await expect.poll(() => focusedValue(page)).toBe('مطورة واجهات أمامية')
  await clickLine(page, all, 'النصف') // « تحسين الأداء… » : la ligature lam-alif sort à l'envers dans le texte extrait
  await expect.poll(() => focusedValue(page)).toContain('تحسين الأداء')
})

test('mobile : depuis l’onglet Aperçu, un toucher bascule sur Modifier et met le focus sur le champ', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'fr-FR', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  await open(page)
  const all = await lines(page)
  await page.getByRole('button', { name: 'Aperçu', exact: true }).click()
  const l = all.find((x) => x.str === 'Développeuse front-end')!
  await expect(page.getByText('Mise à jour de l’aperçu…')).toHaveCount(0)
  const c = sheet(page).nth(l.page)
  await c.scrollIntoViewIfNeeded()
  const b = (await c.boundingBox())!
  await page.touchscreen.tap(b.x + l.x * b.width, b.y + l.y * b.height)
  await expect(page.getByRole('button', { name: 'Modifier', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => focusedValue(page)).toBe('Développeuse front-end')
  await ctx.close()
})

test('sens inverse : le champ actif allume sa ligne dans l’aperçu, le blur l’éteint', async ({ page }) => {
  await open(page)
  const lit = page.locator('main div[role=img]').last().locator('[data-lit]')
  await expect(page.getByText('Mise à jour de l’aperçu…')).toHaveCount(0)
  await expect(lit).toHaveCount(0)
  const field = page.locator('li[data-rid] input[value="Studio Pivoine"]')
  await field.focus()
  await expect(lit.first()).toBeVisible()
  await expect(lit.first()).toHaveAttribute('aria-hidden', 'true')
  await field.blur()
  await expect(lit).toHaveCount(0)
})
