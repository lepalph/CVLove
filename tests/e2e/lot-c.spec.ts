import { spawn, type ChildProcess } from 'node:child_process'
import { expect, test } from '@playwright/test'

// Lot C : le build servi avec les en-têtes de vercel.json (scripts/serve-dist.ts) ne doit provoquer aucune violation de CSP.
let server: ChildProcess
let origin = ''
test.beforeAll(async () => {
  server = spawn('pnpm', ['exec', 'tsx', 'scripts/serve-dist.ts'], { stdio: ['ignore', 'pipe', 'inherit'] })
  origin = await new Promise<string>((ok, ko) => {
    server.stdout!.on('data', (d) => { const m = /port (\d+)/.exec(String(d)); if (m) ok(`http://localhost:${m[1]}`) })
    server.on('exit', () => ko(new Error('serve-dist a quitté')))
  })
})
test.afterAll(() => { server?.kill() })

const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

test('parcours complet sous CSP : aucune violation ni erreur console', async ({ page }) => {
  const problems: string[] = []
  page.on('console', (m) => { if (/Loading aborted/.test(m.text())) return // pdf.js annule un rendu en cours quand on change de page : pas une erreur
    if (m.type() === 'error' || /content security policy|refused to/i.test(m.text())) problems.push(m.text()) })
  page.on('pageerror', (e) => { if (!/Loading aborted/.test(String(e))) problems.push(String(e)) })
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => console.error('CSP ' + e.violatedDirective + ' ' + e.blockedURI)))

  const head = await page.request.get(origin + '/')
  expect(head.headers()['content-security-policy']).toContain("frame-ancestors 'none'")

  await page.goto(origin + '/')
  await expect(page.locator('canvas').first()).toBeAttached({ timeout: 30_000 }) // catalogue / aperçu
  await page.goto(origin + '/#/editeur')
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.locator('canvas').first()).toBeAttached({ timeout: 30_000 })
  await page.getByLabel('Prénom').fill('Zoé')
  await page.locator('input[type=file][accept="image/*"]').setInputFiles({ name: 'p.png', mimeType: 'image/png', buffer: PNG_1PX })
  await expect(page.locator('img[src^="data:image/jpeg"]')).toBeVisible()
  await page.waitForTimeout(1500)
  const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Télécharger le PDF' }).click()])
  expect((await d.path())!).toBeTruthy()
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await page.getByRole('button', { name: 'Nouvelle lettre' }).click()
  await page.getByRole('button', { name: 'Créer la lettre' }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  await expect(page.locator('canvas').first()).toBeAttached({ timeout: 30_000 })
  expect(problems).toEqual([])
})

test('stockage plein : la saisie reste, aucune erreur, tout est écrit dès que la place revient', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.evaluate(() => {
    const orig = Storage.prototype.setItem
    ;(window as any).__orig = orig
    Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError') }
  })
  await page.getByLabel('Prénom').fill('Zoé')
  await page.waitForTimeout(800) // écriture différée échouée
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  await expect(page.getByRole('alert').filter({ hasText: 'Exportez' })).toBeVisible() // bandeau d’erreur de sauvegarde
  await page.evaluate(() => { Storage.prototype.setItem = (window as any).__orig })
  await page.getByLabel('Nom', { exact: true }).fill('Durand') // nouvelle frappe : l'écriture réussit et contient aussi « Zoé »
  await page.reload()
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  await expect(page.getByLabel('Nom', { exact: true })).toHaveValue('Durand')
  expect(errors).toEqual([])
})

test('état corrompu en localStorage : l’éditeur s’ouvre, copie brute gardée', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('done')) { sessionStorage.setItem('done', '1'); localStorage.setItem('cvlove:v2', '{"state":{"documents":[{"kind":"cv","data":{"lang":"xx","personal":{"fields":[{"value":42}],"photo":"https://evil.tld/p.gif"},"sections":[{"kind":"experience","items":[null]}]},"design":{"fontPair":"zz","accent":"rouge"}}]},"version":2}') } })
  const reqs: string[] = []
  page.on('request', (r) => reqs.push(r.url()))
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByLabel('Prénom')).toBeVisible()
  await expect(page.locator('canvas').first()).toBeAttached({ timeout: 20_000 })
  expect(reqs.filter((u) => u.includes('evil.tld'))).toEqual([])
})

test('JSON illisible : copie dans cvlove:corrupt, éditeur utilisable', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('done')) { sessionStorage.setItem('done', '1'); localStorage.setItem('cvlove:v2', '{pas du json') } })
  await page.goto('/#/editeur')
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByLabel('Prénom')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('cvlove:corrupt'))).toBe('{pas du json')
})
