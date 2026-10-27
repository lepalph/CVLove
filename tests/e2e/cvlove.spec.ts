import { deflateSync } from 'node:zlib'
import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Toutes les requêtes de chaque test sont gardées : la promesse « tout local » est vérifiée à la fin.
let external: string[] = []
test.beforeEach(({ page }) => {
  external = []
  page.on('request', (r) => {
    const u = new URL(r.url())
    if (!['localhost', ''].includes(u.hostname) && !['data:', 'blob:'].includes(u.protocol)) external.push(r.url())
  })
})
test.afterEach(() => expect(external, 'requêtes hors localhost').toEqual([]))

/** PNG 64x64 rouge, généré sans dépendance. */
function png(): Buffer {
  const crc = (b: Buffer) => {
    let c = ~0
    for (const x of b) { c ^= x; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1 }
    return ~c >>> 0
  }
  const chunk = (t: string, d: Buffer) => {
    const body = Buffer.concat([Buffer.from(t), d])
    const o = Buffer.alloc(4); o.writeUInt32BE(d.length)
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(body))
    return Buffer.concat([o, body, c])
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(64, 0); ihdr.writeUInt32BE(64, 4); ihdr[8] = 8; ihdr[9] = 2
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: 64 }, () => [200, 30, 30]).flat())])
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(Array.from({ length: 64 }, () => row)))), chunk('IEND', Buffer.alloc(0))])
}

async function pdfOf(path: string) {
  const doc = await getDocument({ data: new Uint8Array(readFileSync(path)), verbosity: 0 }).promise
  let text = ''
  let images = 0
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    text += (await page.getTextContent()).items.map((i) => ('str' in i ? i.str : '')).join(' ') + ' '
    const ops = await page.getOperatorList()
    images += ops.fnArray.filter((f) => f === OPS.paintImageXObject || f === OPS.paintInlineImageXObject).length
  }
  return { text, images }
}

const openEditor = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await expect(page).toHaveURL(/#\/editeur/)
  await expect(page.getByRole('button', { name: 'Classique', pressed: true })).toBeVisible()
  await expect(page.locator('canvas').first()).toBeAttached({ timeout: 20_000 })
}
const canvasShot = (page: Page) => page.locator('canvas').last().screenshot()
const download = async (page: Page) => {
  const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Télécharger le PDF' }).click()])
  return d
}

test('accueil → éditeur, édition du prénom, aperçu mis à jour', async ({ page }) => {
  await openEditor(page)
  await page.waitForTimeout(1500)
  const before = await canvasShot(page)
  await page.getByLabel('Prénom').fill('Zoé')
  await expect.poll(async () => !(await canvasShot(page)).equals(before), { timeout: 10_000 }).toBe(true)
})

test('accueil : « Commencer avec ce modèle » (Moderne), puis changement de modèle sans perte du prénom', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Votre CV en PDF, sans compte et sans frais.')
  await page.getByRole('button', { name: /Commencer avec ce modèle \(Moderne\)/ }).click()
  await expect(page).toHaveURL(/#\/editeur/)
  await expect(page.getByRole('button', { name: 'Moderne', pressed: true })).toBeVisible()
  await page.getByLabel('Prénom').fill('Zoé')
  await page.getByRole('button', { name: 'Minimal' }).click()
  await expect(page.getByRole('button', { name: 'Minimal', pressed: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Moderne', pressed: false })).toBeVisible()
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  await expect(page.locator('canvas').first()).toBeAttached({ timeout: 20_000 })
})

test('photo ajoutée : présente dans le PDF', async ({ page }) => {
  await openEditor(page)
  const base = await pdfOf((await (await download(page)).path())!)
  await page.locator('input[type=file][accept="image/*"]').setInputFiles({ name: 'p.png', mimeType: 'image/png', buffer: png() })
  await expect(page.locator('img[src^="data:image/jpeg"]')).toBeVisible()
  const withPhoto = await pdfOf((await (await download(page)).path())!)
  expect(withPhoto.images).toBeGreaterThan(base.images)
})

test('téléchargement : CV-Prenom-Nom.pdf non vide contenant le prénom', async ({ page }) => {
  await openEditor(page)
  await page.getByLabel('Prénom').fill('Zoé')
  await page.getByLabel('Nom', { exact: true }).fill('Durand')
  const d = await download(page)
  expect(d.suggestedFilename()).toBe('CV-Zoe-Durand.pdf')
  const path = (await d.path())!
  expect(readFileSync(path).length).toBeGreaterThan(1000)
  expect((await pdfOf(path)).text).toContain('Zoé')
})

test('langue du CV : EN change les titres pas le contenu, AR passe en RTL', async ({ page }) => {
  await openEditor(page)
  await page.getByLabel('Prénom').fill('Zoé')
  const sectionTitle = page.locator('h3').filter({ hasText: 'Formation' })
  await expect(sectionTitle).toBeVisible()
  await page.getByLabel('Langue du CV').first().selectOption('en')
  await expect(page.locator('h3').filter({ hasText: 'Education' })).toBeVisible()
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  const en = await pdfOf((await (await download(page)).path())!)
  expect(en.text).toContain('Education')
  expect(en.text).toContain('Zoé')
  await page.getByLabel('Langue du CV').first().selectOption('ar')
  // Le CV arabe ne change pas la direction de l'interface (langue d'interface séparée)
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await page.getByLabel(/Langue de l.interface/).selectOption('ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
})

test('export JSON puis import après « Tout effacer »', async ({ page }) => {
  await openEditor(page)
  await page.getByLabel('Prénom').fill('Zoé')
  const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exporter (JSON)' }).click()])
  const json = readFileSync((await d.path())!)
  page.once('dialog', (x) => x.accept())
  await page.getByRole('button', { name: 'Tout effacer' }).click()
  await expect(page.getByLabel('Prénom')).toHaveValue('')
  await page.locator('#imp').setInputFiles({ name: 'cvlove.json', mimeType: 'application/json', buffer: json })
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
})

test('rechargement : données conservées', async ({ page }) => {
  await openEditor(page)
  await page.getByLabel('Prénom').fill('Zoé')
  await page.reload()
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
})
