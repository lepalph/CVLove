import { expect, test, type Page } from '@playwright/test'
import { datesText } from '../../src/i18n/dates'
import { ui } from '../../src/i18n/ui'

// Date en une saisie : un champ texte, normalisé en sortie de champ, erreur en clair sous le champ.
const open = async (page: Page) => {
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet', exact: true }).click()
  await page.getByRole('button', { name: ui.fr.samples.dev }).click()
  await expect(page.getByLabel('Prénom')).toHaveValue('Camille')
  const cur = page.getByRole('checkbox', { name: ui.fr.current }).first()
  if (await cur.isChecked()) await cur.uncheck() // le poste de l'exemple est « En cours » : sa fin est désactivée
}
/** Premier poste (« Début » / « Fin »), dans la langue d'interface donnée. */
const fields = (page: Page, l: 'fr' | 'ar' = 'fr') => ({
  start: page.getByLabel(ui[l].start, { exact: true }).first(),
  end: page.getByLabel(ui[l].end, { exact: true }).first(),
  cur: page.getByRole('checkbox', { name: ui[l].current }).first(),
})
const stored = (page: Page) => page.evaluate(() => localStorage.getItem('cvlove:v2') ?? '')
const type = async (loc: ReturnType<Page['getByLabel']>, text: string) => { await loc.fill(text); await loc.blur() }

test('saisie : formats libres, normalisés en MM/AAAA, stockés en AAAA-MM', async ({ page }) => {
  await open(page)
  const { start } = fields(page)
  await expect(start).toHaveAttribute('placeholder', 'MM/AAAA')
  await expect(start).not.toHaveAttribute('aria-invalid', 'true')
  for (const [text, shown, saved] of [
    ['3/2019', '03/2019', '"start":"2019-03"'], ['032020', '03/2020', '"start":"2020-03"'], ['mars 2021', '03/2021', '"start":"2021-03"'],
    ['Sept 2017', '09/2017', '"start":"2017-09"'], ['3.18', '03/2018', '"start":"2018-03"'], ['2016', '2016', '"start":"2016"'],
  ] as const) {
    await type(start, text)
    await expect(start).toHaveValue(shown)
    await expect.poll(() => stored(page)).toContain(saved)
  }
  await start.fill('2015')
  await start.press('Enter') // Entrée valide aussi
  await expect.poll(() => stored(page)).toContain('"start":"2015"')
  await expect(page.locator('select[aria-label^="Début"]')).toHaveCount(0)
})

test('erreur : message clair sous le champ, rien n’est effacé ni enregistré', async ({ page }) => {
  await open(page)
  const { start } = fields(page)
  await type(start, '03/2021')
  await expect.poll(() => stored(page)).toContain('"start":"2021-03"')
  await type(start, '13/45')
  await expect(start).toHaveAttribute('aria-invalid', 'true')
  await expect(start).toHaveValue('13/45') // la saisie reste, rien n'est effacé
  const err = page.getByText(datesText.fr.invalid).first()
  await expect(err).toBeVisible()
  const id = await err.getAttribute('id')
  await expect(start).toHaveAttribute('aria-describedby', id!)
  expect(await stored(page)).toContain('"start":"2021-03"') // la valeur gardée n'a pas bougé
  await start.fill('4/2021') // retaper efface l'erreur
  await expect(start).not.toHaveAttribute('aria-invalid', 'true')
  await start.blur()
  await expect(start).toHaveValue('04/2021')
  await expect(page.getByText(datesText.fr.invalid)).toHaveCount(0)
})

test('règles : fin avant début refusée, « En cours » désactive la fin, champ vidé = date vide', async ({ page }) => {
  await open(page)
  const { start, end, cur } = fields(page)
  await type(start, '09/2018')
  await type(end, '02/2018')
  await expect(end).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText(datesText.fr.beforeStart).first()).toBeVisible()
  await type(end, '02/2021')
  await expect(end).toHaveValue('02/2021')
  await expect(end).not.toHaveAttribute('aria-invalid', 'true')
  if (await cur.isChecked()) await cur.uncheck()
  await cur.check()
  await expect(end).toBeDisabled()
  await expect(start).toBeEnabled()
  await cur.uncheck()
  await type(end, '')
  await expect(end).toHaveValue('')
  await expect.poll(() => stored(page)).toContain('"end":""')
})

test('arabe : chiffres arabes-indiens et nom de mois, champ en LTR, placeholder localisé', async ({ page }) => {
  await open(page)
  await page.getByLabel(/Langue de l.interface/).selectOption('ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  const { start, end } = fields(page, 'ar')
  await expect(start).toHaveAttribute('placeholder', datesText.ar.placeholder)
  await expect(start).toHaveAttribute('dir', 'ltr')
  await type(start, '٠٣/٢٠٢١')
  await expect(start).toHaveValue('03/2021')
  await expect.poll(() => stored(page)).toContain('"start":"2021-03"')
  await type(end, 'ديسمبر ٢٠٢٢')
  await expect(end).toHaveValue('12/2022')
  await type(end, 'xx')
  await expect(page.getByText(datesText.ar.invalid).first()).toBeVisible()
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('champ date : cible de 44 px, pas de débordement, erreur visible', async ({ page }) => {
    await open(page)
    const { start } = fields(page)
    await start.scrollIntoViewIfNeeded()
    expect((await start.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await type(start, 'n’importe quoi')
    const err = page.getByText(datesText.fr.invalid).first()
    await expect(err).toBeVisible()
    const box = (await err.boundingBox())!
    expect(box.x + box.width).toBeLessThanOrEqual(390)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await type(start, '3/2020')
    await expect(start).toHaveValue('03/2020')
  })
})

test('changer le début après la fin signale l’erreur sur la fin', async ({ page }) => {
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet', exact: true }).click()
  await page.getByRole('button', { name: 'Informatique' }).click()
  const s2 = page.getByLabel('Début').nth(1), e2 = page.getByLabel('Fin').nth(1) // 2e expérience de l'exemple, terminée
  await s2.fill(`01/${new Date().getFullYear()}`)
  await s2.blur()
  await expect(e2).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('La fin ne peut pas précéder le début.')).toBeVisible()
  await s2.fill('01/2010')
  await s2.blur()
  await expect(e2).not.toHaveAttribute('aria-invalid', 'true')
})
