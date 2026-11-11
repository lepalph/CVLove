// Nouvelles sections (docs/wiki/nouvelles-sections.md) : bénévolat, certifications, publications.
import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { guide } from '../../src/i18n/guide'
import { cvLabels } from '../../src/i18n/labels'
import { undoText } from '../../src/i18n/undo'
import { ui } from '../../src/i18n/ui'

test.use({ locale: 'fr-FR', viewport: { width: 1440, height: 1000 } })

const t = ui.fr
const L = cvLabels.fr.sections
const section = (page: Page, name: string) => page.locator('li[data-rid]').filter({ has: page.getByRole('heading', { level: 3, name, exact: true }) })
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('cvlove:v2') ?? '{"state":{"documents":[]}}').state.documents.find((d: { kind: string }) => d.kind === 'cv')?.data)

async function openFull(page: Page) {
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: guide.fr.full, exact: true }).click()
  await page.getByRole('button', { name: t.samples.dev }).click()
  await expect(page.getByLabel('Prénom')).not.toHaveValue('')
}

/** Ajoute une section depuis « Ajouter une section » (mode complet). */
async function add(page: Page, kind: 'volunteering' | 'certifications' | 'publications') {
  await page.getByRole('button', { name: `+ ${t.addSection}` }).click()
  await page.getByRole('button', { name: `+ ${t.kinds[kind]}`, exact: true }).click()
  await expect(section(page, L[kind])).toBeVisible()
}

async function pdfLines(page: Page) {
  const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: t.download }).click()])
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

test('complet : les trois types s’ajoutent, avec leurs champs, et sortent dans le PDF', async ({ page }) => {
  await openFull(page)
  await add(page, 'certifications')
  const cert = section(page, L.certifications)
  // certification : titre, organisme, une date ; ni lieu, ni début/fin, ni description
  await expect(cert.getByLabel('Lieu', { exact: true })).toHaveCount(0)
  await expect(cert.getByLabel(t.start, { exact: true })).toHaveCount(0)
  await expect(cert.getByLabel(t.kindFields.experience[2], { exact: true })).toHaveCount(0)
  await cert.getByLabel(t.kindFields.certifications[0], { exact: true }).fill('AWS Solutions Architect')
  await cert.getByLabel(t.kindFields.certifications[1], { exact: true }).fill('Amazon Web Services')
  await cert.getByLabel('Date', { exact: true }).fill('03/2024')
  await cert.getByLabel('Date', { exact: true }).press('Enter')

  await add(page, 'volunteering')
  const vol = section(page, L.volunteering)
  await vol.getByLabel(t.kindFields.volunteering[0], { exact: true }).fill('Bénévole')
  await vol.getByLabel(t.kindFields.volunteering[1], { exact: true }).fill('Banque alimentaire')
  await vol.getByLabel('Lieu', { exact: true }).fill('Lyon')
  await vol.getByLabel(t.start, { exact: true }).fill('01/2020')
  await vol.getByLabel(t.start, { exact: true }).press('Enter')
  await vol.locator('textarea').fill('- Tri et distribution des colis')

  await add(page, 'publications')
  const pub = section(page, L.publications)
  await pub.getByLabel(t.kindFields.publications[0], { exact: true }).fill('Accessibilité des formulaires')
  await pub.getByLabel(t.kindFields.publications[1], { exact: true }).fill('Revue du Web')
  await pub.getByLabel('Date', { exact: true }).fill('2023')
  await pub.getByLabel('Date', { exact: true }).press('Enter')

  // une section présente ne se repropose pas
  await page.getByRole('button', { name: `+ ${t.addSection}` }).click()
  for (const k of ['volunteering', 'certifications', 'publications'] as const) await expect(page.getByRole('button', { name: `+ ${t.kinds[k]}`, exact: true })).toHaveCount(0)

  await expect.poll(async () => (await stored(page))?.sections.find((s: { kind: string }) => s.kind === 'certifications')?.items[0].start).toBe('2024-03')
  const text = (await pdfLines(page)).map((l) => l.str).join(' ')
  for (const w of [L.certifications, 'AWS Solutions Architect', 'Amazon Web Services', 'mars 2024', L.volunteering, 'Banque alimentaire', 'Tri et distribution des colis', L.publications, 'Accessibilité des formulaires', 'Revue du Web'])
    expect(text).toContain(w)

  // deux colonnes : la certification passe dans la colonne latérale, avec organisme et date
  await page.getByRole('button', { name: 'Moderne · Bandeau' }).click()
  await expect(page.getByRole('button', { name: 'Moderne · Bandeau', pressed: true })).toBeVisible()
  const side = (await pdfLines(page)).map((l) => l.str).join(' ')
  expect(side).toContain('Amazon Web Services')
  expect(side).toContain('mars 2024')
})

test('repli, résumé, sommaire, glisser et annuler une suppression', async ({ page }) => {
  await openFull(page)
  await add(page, 'certifications')
  const cert = section(page, L.certifications)
  await cert.getByLabel(t.kindFields.certifications[0], { exact: true }).fill('PSC1')
  await cert.getByRole('button', { name: `Replier la section ${L.certifications}` }).click()
  await expect(cert.getByText('1 certification · PSC1')).toBeVisible()
  await expect.poll(async () => (await stored(page))?.sections.find((s: { kind: string }) => s.kind === 'certifications')?.collapsed).toBe(true)
  await page.reload()
  await expect(section(page, L.certifications).getByText('1 certification · PSC1')).toBeVisible()

  // sommaire
  await page.getByRole('navigation', { name: 'Aller à une section' }).getByRole('button', { name: L.certifications }).click()
  await expect(page.getByRole('heading', { level: 3, name: L.certifications })).toBeFocused()

  // glisser la section (dernière) au-dessus de la précédente
  const heads = page.locator('h3[tabindex="-1"]')
  const n = await heads.count()
  const above = (await heads.nth(n - 2).innerText()).trim()
  const grip = page.getByRole('button', { name: `Glisser pour déplacer la section ${L.certifications}` })
  await grip.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  const b = (await grip.boundingBox())!
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(300)
  const top = (await heads.nth(n - 2).boundingBox())!.y - 10 // les sections se replient dès la prise : on mesure après
  await page.mouse.move(b.x + b.width / 2, (b.y + top) / 2, { steps: 5 })
  await page.mouse.move(b.x + b.width / 2, top, { steps: 5 })
  await page.mouse.up()
  await expect(heads.nth(n - 2)).toHaveText(L.certifications)
  await expect(heads.nth(n - 1)).toHaveText(above)

  // supprimer puis annuler
  const u = undoText.fr
  await section(page, L.certifications).getByRole('button', { name: `Déplier la section ${L.certifications}` }).click() // les actions sont sous le contenu
  await section(page, L.certifications).getByRole('button', { name: `${t.remove}${t.onSection.replace('{x}', L.certifications)}` }).click()
  await expect(section(page, L.certifications)).toHaveCount(0)
  await page.getByRole('button', { name: u.undo, exact: true }).click()
  await expect(heads.nth(n - 2)).toHaveText(L.certifications) // rétablie à sa place
})

test('aperçu relié : un clic sur une certification mène à son champ', async ({ page }) => {
  await openFull(page)
  await add(page, 'certifications')
  const cert = section(page, L.certifications)
  await cert.getByLabel(t.kindFields.certifications[0], { exact: true }).fill('Certification Scrum Master')
  await cert.getByLabel(t.kindFields.certifications[1], { exact: true }).fill('Scrum Alliance')
  const all = await pdfLines(page)
  const l = all.find((x) => x.str.includes('Certification Scrum Master'))!
  expect(l).toBeTruthy()
  await expect(page.getByText('Mise à jour de l’aperçu…')).toHaveCount(0)
  const c = page.locator('main div[role=img]').last().locator('canvas').nth(l.page)
  await c.scrollIntoViewIfNeeded()
  const box = (await c.boundingBox())!
  await page.mouse.click(box.x + l.x * box.width, box.y + l.y * box.height)
  await expect.poll(() => page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.value)).toBe('Certification Scrum Master')
})

test('guidé : les nouveaux types ne sont pas proposés d’office, mais une section ajoutée en complet y reste modifiable', async ({ page }) => {
  await page.goto('/#/editeur')
  const next = page.getByRole('button', { name: guide.fr.next })
  for (let i = 0; i < 6; i++) await next.click()
  await expect(page.locator('#step-title')).toHaveText('Autres sections')
  await expect(page.getByRole('button', { name: `+ ${t.kinds.projects}` })).toBeVisible()
  for (const k of ['volunteering', 'certifications', 'publications'] as const) await expect(page.getByRole('button', { name: `+ ${t.kinds[k]}`, exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: guide.fr.full, exact: true }).click()
  await page.getByLabel('Prénom').fill('Zoé')
  await add(page, 'publications')
  await page.getByRole('button', { name: guide.fr.guided, exact: true }).click() // l'étape en cours survit à la bascule
  await expect(page.locator('#step-title')).toHaveText('Autres sections')
  await expect(section(page, L.publications)).toBeVisible()
})
