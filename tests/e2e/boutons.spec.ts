// Audit de chaque bouton, lien, menu et contrôle : l'effet réel est vérifié (stockage local, PDF téléchargé, URL, focus, annonce vocale).
// Les identifiants [Xnn] renvoient au tableau de docs/wiki/audit-boutons.md.
import { deflateSync } from 'node:zlib'
import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { extra } from '../../src/i18n/extra'
import { guide } from '../../src/i18n/guide'
import { GITHUB_URL, home } from '../../src/i18n/home'
import { cvLabels } from '../../src/i18n/labels'
import { letterUi } from '../../src/i18n/letter'
import { tips } from '../../src/i18n/tips'
import { ui } from '../../src/i18n/ui'
import { v2 } from '../../src/i18n/v2'

// La promesse « tout local » est vérifiée à la fin de chaque test.
let external: string[] = []
test.beforeEach(({ page }) => {
  external = []
  page.on('request', (r) => {
    const u = new URL(r.url())
    if (!['localhost', ''].includes(u.hostname) && !['data:', 'blob:'].includes(u.protocol)) external.push(r.url())
  })
})
test.afterEach(() => expect(external, 'requêtes hors localhost').toEqual([]))

// ---------- aides ----------

const ACCENTS = ['#c2410c', '#1d4ed8', '#047857', '#7c3aed', '#be185d', '#0e7490', '#374151']

/** PNG 64x64 rouge, sans dépendance. */
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
    images += (await page.getOperatorList()).fnArray.filter((f) => f === OPS.paintImageXObject || f === OPS.paintInlineImageXObject).length
  }
  return { text, images, pages: doc.numPages, view: (await doc.getPage(1)).view.slice(2) }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const raw = (page: Page) => page.evaluate(() => { const r = localStorage.getItem('cvlove:v2'); return r ? JSON.parse(r).state : null })
const active = async (page: Page): Promise<any> => { const s = await raw(page); return s?.documents.find((d: any) => d.id === s.activeId) ?? null }
/** Interroge le document actif tel qu'il est écrit dans le stockage (écriture différée de 500 ms). */
const poll = (page: Page, f: (d: any) => unknown) => expect.poll(async () => { const d = await active(page); return d ? f(d) : undefined }, { timeout: 8000 })
const docsOf = async (page: Page): Promise<any[]> => (await raw(page))?.documents ?? []

const dlBtn = (page: Page) => page.getByRole('banner').getByRole('button', { name: ui.fr.download })
const download = async (page: Page, name = ui.fr.download) => {
  const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('banner').getByRole('button', { name }).click()])
  return d
}
const screenshotOfPreview = (page: Page) => page.getByRole('img', { name: /Aperçu/ }).locator('canvas').last().screenshot()
/** Après `act`, la feuille d'aperçu doit avoir changé. */
const previewChanges = async (page: Page, act: () => Promise<unknown>) => {
  await expect(page.getByRole('img', { name: /Aperçu/ }).locator('canvas').first()).toBeAttached({ timeout: 25_000 })
  await page.waitForTimeout(800)
  const before = await screenshotOfPreview(page)
  await act()
  await expect.poll(async () => !(await screenshotOfPreview(page)).equals(before), { timeout: 20_000 }).toBe(true)
}

/** Éditeur de CV (français). `full` : mode complet ; `sample` : exemple « Informatique » (Camille Marchand). */
const edit = async (page: Page, o: { full?: boolean; sample?: boolean } = {}) => {
  const { full = true, sample = false } = o
  await page.goto('/#/editeur')
  if (full) await page.getByRole('button', { name: guide.fr.full, exact: true }).click()
  if (sample) {
    await page.getByRole('button', { name: ui.fr.samples.dev }).click()
    await expect(page.getByLabel('Prénom')).toHaveValue('Camille')
    await poll(page, (d) => d.data.personal.firstName).toBe('Camille')
  }
}
/** Sur mobile le bloc Design est replié : on l'ouvre. */
const openDesign = async (page: Page) => {
  const sum = page.locator('summary', { hasText: v2.fr.design })
  if (!(await sum.evaluate((s) => (s.parentElement as HTMLDetailsElement).open))) await sum.click()
}
const sectionLi = (page: Page, title: string | RegExp) => page.locator('li').filter({ has: page.getByRole('heading', { level: 3, name: title }) }).first()
const kinds = (d: any) => d.data.sections.map((s: any) => s.kind)
const T = (lang: 'fr' | 'en' | 'ar') => ({ u: ui[lang], v: v2[lang], g: guide[lang], l: letterUi[lang], x: extra[lang], t: tips[lang], h: home[lang] })
const jsonFile = (docs: unknown[]) => ({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'cvlove', version: 2, documents: docs })) })

test.describe.configure({ timeout: 150_000 }) // react-pdf bloque le fil principal : les machines chargées sont lentes

const VPS = [
  { name: 'bureau', size: { width: 1440, height: 900 }, wide: true },
  { name: 'mobile', size: { width: 390, height: 844 }, wide: false },
] as const

for (const vp of VPS) {
  test.describe(`${vp.name} ${vp.size.width} px, français`, () => {
    test.use({ viewport: vp.size, locale: 'fr-FR' })

    // =============== A. ACCUEIL ===============

    test(`[A01] accueil : lien d'évitement, logo, Mes documents, liens GitHub (${vp.name})`, async ({ page }) => {
      await page.goto('/')
      const skip = page.getByRole('button', { name: extra.fr.skip })
      await skip.focus()
      await skip.press('Enter')
      await expect(page.locator('main#main')).toBeFocused()
      // Mes documents
      await page.getByRole('link', { name: v2.fr.docs }).click()
      await expect(page).toHaveURL(/#\/documents$/)
      await expect(page.locator('h1')).toBeFocused()
      await expect(page).toHaveTitle(`${v2.fr.docs} · CVLove`)
      // logo : retour à l'accueil
      await page.getByRole('link', { name: 'CVLove', exact: true }).click()
      await expect(page).toHaveURL(/#\/$/)
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Votre CV en PDF')
      // liens vers le code : bons href (on ne quitte pas le site pendant le test)
      const gh = page.locator(`a[href="${GITHUB_URL}"]`)
      expect(await gh.count()).toBeGreaterThanOrEqual(4)
      for (const name of [home.fr.seeCode, home.fr.readCode, home.fr.contribute, home.fr.source]) {
        await expect(page.getByRole('link', { name }).first()).toHaveAttribute('href', GITHUB_URL)
      }
    })

    if (vp.wide) {
      test('[A02] accueil : liens de la barre Modèles et Comment ça marche mènent aux ancres', async ({ page }) => {
        await page.goto('/')
        await page.locator('header a[href="#modeles"]').click()
        await expect(page).toHaveURL(/#modeles$/)
        await expect(page.getByRole('heading', { level: 2, name: /modèles/i }).first()).toBeInViewport()
        await page.locator('header a[href="#comment"]').click()
        await expect(page).toHaveURL(/#comment$/)
        await expect(page.locator('#comment h2')).toBeInViewport()
        await expect(page.getByRole('heading', { level: 1 })).toBeAttached() // la vue reste l'accueil
      })
    }

    test(`[A03] accueil : langue d'interface (fr → en → ar) (${vp.name})`, async ({ page }) => {
      await page.goto('/')
      const sel = page.getByLabel(ui.fr.uiLang)
      await sel.selectOption('en')
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Your CV as a PDF')
      await expect.poll(async () => (await raw(page))?.uiLang).toBe('en')
      await page.getByLabel(ui.en.uiLang).selectOption('ar')
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
      await page.getByLabel(ui.ar.uiLang).selectOption('fr')
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
    })

    test(`[A04] accueil : « Créer mon CV » ouvre l'éditeur sur un CV vierge, et crée un nouveau CV si l'actuel est rempli (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      const first = (await active(page)).id
      await page.goto('/')
      await page.getByRole('link', { name: home.fr.create }).last().click() // bouton du bandeau final (celui de l'en-tête est masqué sur mobile)
      await expect(page).toHaveURL(/#\/editeur$/)
      await expect(page).toHaveTitle(/Éditeur de CV/)
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
      await page.getByRole('button', { name: guide.fr.full, exact: true }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('')
      // l'ancien CV est intact dans le stockage et n'est plus l'actif
      await expect.poll(async () => (await raw(page)).activeId).not.toBe(first)
      expect((await raw(page)).documents.map((d: any) => d.id)).toContain(first)
    })

    test(`[A05] accueil : le hero « Créer mon CV » et le lien de l'en-tête (bureau) vont à l'éditeur (${vp.name})`, async ({ page }) => {
      await page.goto('/')
      const links = page.getByRole('link', { name: home.fr.create })
      await links.first().click()
      await expect(page).toHaveURL(/#\/editeur$/)
    })

    test(`[A06] accueil : les 4 boutons de démo changent l'exemple affiché (${vp.name})`, async ({ page }) => {
      await page.goto('/')
      const group = page.getByRole('group', { name: home.fr.demoLabel })
      const btns = group.getByRole('button')
      await expect(btns).toHaveCount(4)
      await expect(group.locator('xpath=..').locator('canvas').first()).toBeAttached({ timeout: 25_000 })
      // PdfCanvas remplace ses canvas à chaque rendu : on lit l'image depuis le conteneur, stable, en une seule évaluation.
      const shot = () => group.locator('xpath=..').evaluate((el) => el.querySelector('canvas')?.toDataURL() ?? '')
      let prev = await shot()
      for (let i = 1; i < 4; i++) {
        await btns.nth(i).click()
        await expect(btns.nth(i)).toHaveAttribute('aria-pressed', 'true')
        await expect(btns.nth(i - 1)).toHaveAttribute('aria-pressed', 'false')
        await expect.poll(async () => (await shot()) !== prev, { timeout: 25_000 }).toBe(true)
        prev = await shot()
      }
    })

    test(`[A07] accueil : filtres du catalogue (catégorie, colonnes, photo, Tous) (${vp.name})`, async ({ page }) => {
      await page.goto('/')
      const items = page.locator('#modeles ul > li')
      const all = await items.count()
      expect(all).toBeGreaterThan(20)
      const cat = page.locator('#modeles').getByRole('group', { name: v2.fr.category })
      await cat.getByRole('button', { name: v2.fr.cats.moderne }).click()
      await expect(cat.getByRole('button', { name: v2.fr.cats.moderne })).toHaveAttribute('aria-pressed', 'true')
      const moderne = await items.count()
      expect(moderne).toBeGreaterThan(0)
      expect(moderne).toBeLessThan(all)
      const cols = page.locator('#modeles').getByRole('group', { name: v2.fr.columns })
      await cols.getByRole('button', { name: v2.fr.twoCols }).click()
      const two = await items.count()
      expect(two).toBeLessThanOrEqual(moderne)
      const photo = page.locator('#modeles').getByRole('group', { name: v2.fr.photoFilter })
      await photo.getByRole('button', { name: v2.fr.withPhoto }).click()
      expect(await items.count()).toBeLessThanOrEqual(two)
      // les « Tous » rétablissent le catalogue
      await cat.getByRole('button', { name: v2.fr.all }).click()
      await cols.getByRole('button', { name: v2.fr.all }).click()
      await photo.getByRole('button', { name: v2.fr.all }).click()
      expect(await items.count()).toBe(all)
    })

    test(`[A08] accueil : « Commencer avec ce modèle » ouvre l'éditeur guidé à l'étape Identité avec ce modèle (${vp.name})`, async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Commencer avec ce modèle (Moderne · Bandeau)' }).click()
      await expect(page).toHaveURL(/#\/editeur$/)
      await expect(page.locator('#step-title')).toHaveText(guide.fr.steps[1]) // Modèle déjà fait
      await page.getByRole('button', { name: guide.fr.full, exact: true }).click()
      await openDesign(page)
      await expect(page.getByRole('button', { name: 'Moderne · Bandeau', pressed: true })).toBeVisible()
    })

    test(`[A09] accueil : « Reprendre » rouvre le CV rempli (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await page.getByLabel('Prénom').fill('Zoé')
      await poll(page, (d) => d.data.personal.firstName).toBe('Zoé')
      await page.goto('/')
      await expect(page.getByRole('heading', { level: 2, name: 'Reprendre mon CV' })).toBeVisible()
      await page.getByRole('link', { name: 'Reprendre', exact: true }).click()
      await expect(page).toHaveURL(/#\/editeur$/)
      await page.getByRole('button', { name: guide.fr.full, exact: true }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
    })

    // =============== B. ÉDITEUR : en-tête, mode, navigation ===============

    test(`[B01] éditeur : bascule Guidé / Complet, mémorisée avec le document (${vp.name})`, async ({ page }) => {
      await page.goto('/#/editeur')
      await expect(page.getByRole('button', { name: 'Guidé', pressed: true })).toBeVisible()
      await page.getByRole('button', { name: 'Complet' }).click()
      await expect(page.getByRole('button', { name: 'Complet', pressed: true })).toBeVisible()
      await expect(page.getByLabel('Prénom')).toBeVisible()
      await page.getByLabel('Prénom').fill('Zoé')
      await poll(page, (d) => d.editorMode).toBe('full')
      await page.getByRole('button', { name: 'Guidé' }).click()
      await poll(page, (d) => d.editorMode).toBe('guided')
      await expect(page.locator('#step-title')).toBeVisible()
      await page.reload()
      await expect(page.getByRole('button', { name: 'Guidé', pressed: true })).toBeVisible()
    })

    test(`[B02] éditeur : logo et lien Mes documents de l'en-tête (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByRole('banner').getByRole('link', { name: v2.fr.docs }).click()
      await expect(page).toHaveURL(/#\/documents$/)
      await page.goBack()
      await page.getByRole('banner').getByRole('link', { name: 'CVLove', exact: true }).click()
      await expect(page).toHaveURL(/#\/$/)
    })

    test(`[B03] éditeur : langue d'interface change les libellés et le stockage (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel(ui.fr.uiLang).first().selectOption('en')
      await expect(page.getByLabel('First name')).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect.poll(async () => (await raw(page))?.uiLang ?? 'en').toBe('en')
      await page.getByLabel(ui.en.uiLang).first().selectOption('fr')
      await expect(page.getByLabel('Prénom')).toBeVisible()
    })

    test(`[B04] éditeur : pied de page « Comment le vérifier » déplie l'explication (${vp.name})`, async ({ page }) => {
      await edit(page)
      const foot = page.getByRole('contentinfo')
      await expect(foot).toContainText('0 requête vers un autre site')
      await foot.getByText(extra.fr.netHow).click()
      await expect(foot).toContainText('onglet Réseau')
      await foot.getByText(extra.fr.netHow).click()
      await expect(foot.getByText('onglet Réseau')).toBeHidden()
    })

    test(`[B05] éditeur : Télécharger le PDF (CV rempli) : fichier, contenu, annonce, focus gardé (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      const btn = dlBtn(page)
      await btn.focus()
      const [d] = await Promise.all([page.waitForEvent('download'), btn.press('Enter')])
      expect(d.suggestedFilename()).toBe('CV-Camille-Marchand.pdf')
      const pdf = await pdfOf((await d.path())!)
      expect(pdf.text).toContain('Camille')
      expect(pdf.text).toContain('Formation')
      await expect(btn).toBeFocused()
      await expect(page.getByRole('status').filter({ hasText: 'PDF téléchargé : CV-Camille-Marchand.pdf' })).toBeAttached()
    })

    test(`[B06] éditeur : Télécharger le PDF sur un CV vide affiche une alerte et ne télécharge rien (${vp.name})`, async ({ page }) => {
      await edit(page)
      let got = false
      page.on('download', () => { got = true })
      await dlBtn(page).click()
      await expect(page.getByRole('alert').filter({ hasText: extra.fr.emptyDownload })).toBeVisible()
      await page.waitForTimeout(500)
      expect(got).toBe(false)
      await expect(dlBtn(page)).toBeFocused()
      await page.getByLabel('Prénom').fill('Zoé') // la correction efface l'alerte
      await expect(page.getByRole('alert').filter({ hasText: extra.fr.emptyDownload })).toBeHidden()
    })

    if (!vp.wide) {
      test('[B07] mobile : bascule Modifier / Aperçu montre le panneau voulu, le zoom agrandit la feuille', async ({ page }) => {
        await edit(page, { sample: true })
        const grp = page.getByRole('group', { name: 'Affichage', exact: true })
        await expect(page.getByLabel('Prénom')).toBeVisible()
        await grp.getByRole('button', { name: ui.fr.tabPreview }).click()
        await expect(page.getByLabel('Prénom')).toBeHidden()
        const sheet = page.getByRole('img', { name: /Aperçu/ })
        await expect(sheet.locator('canvas').first()).toBeAttached({ timeout: 25_000 })
        const w1 = (await sheet.boundingBox())!.width
        const zoom = page.getByRole('button', { name: extra.fr.zoom })
        await zoom.click()
        await expect(zoom).toHaveAttribute('aria-pressed', 'true')
        await expect.poll(async () => (await sheet.boundingBox())!.width).toBeGreaterThan(w1 * 1.5)
        await zoom.click()
        await expect(zoom).toHaveAttribute('aria-pressed', 'false')
        await grp.getByRole('button', { name: ui.fr.tabEdit }).click()
        await expect(page.getByLabel('Prénom')).toBeVisible()
        await expect(grp.getByRole('button', { name: ui.fr.tabEdit })).toHaveAttribute('aria-pressed', 'true')
      })
    } else {
      test('[B07] bureau : pas de bascule Modifier / Aperçu, formulaire et aperçu côte à côte', async ({ page }) => {
        await edit(page, { sample: true })
        await expect(page.getByRole('group', { name: 'Affichage', exact: true })).toBeHidden()
        await expect(page.getByLabel('Prénom')).toBeVisible()
        await expect(page.getByRole('img', { name: /Aperçu/ })).toBeVisible()
      })
    }

    test(`[B08] éditeur : plusieurs pages, la barre de pages saute à la page choisie (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await page.locator('textarea').first().fill('Un paragraphe de profil assez long. '.repeat(400))
      if (!vp.wide) await page.getByRole('group', { name: 'Affichage', exact: true }).getByRole('button', { name: ui.fr.tabPreview }).click()
      const bar = page.getByRole('group', { name: /pages$/ })
      await expect(bar).toBeVisible({ timeout: 30_000 })
      const p2 = bar.getByRole('button', { name: tips.fr.page.replace('{n}', '2') })
      await p2.click()
      await expect(page.getByRole('img', { name: /Aperçu/ }).locator('canvas').nth(1)).toBeInViewport()
    })

    // =============== C. ÉDITEUR GUIDÉ ===============

    test(`[C01] guidé : Suivant / Passer / Précédent, étapes, focus sur le titre, « faite » seulement si remplie (${vp.name})`, async ({ page }) => {
      await page.goto('/#/editeur')
      const title = page.locator('#step-title')
      const prev = page.getByRole('button', { name: guide.fr.prev })
      await expect(title).toHaveText('Modèle')
      await expect(prev).toBeDisabled()
      await page.getByRole('button', { name: guide.fr.next }).click()
      await expect(title).toHaveText('Identité')
      await expect(title).toBeFocused()
      await page.getByLabel('Prénom').fill('Zoé')
      await page.getByRole('button', { name: guide.fr.next }).click()
      await expect(title).toHaveText('Profil')
      await page.getByRole('button', { name: guide.fr.skip }).click()
      await expect(title).toHaveText('Expérience')
      await prev.click()
      await expect(title).toHaveText('Profil')
      await expect(title).toBeFocused()
      if (vp.wide) {
        const bar = page.getByRole('navigation', { name: guide.fr.stepsLabel })
        await expect(bar.getByRole('button', { name: 'Profil', exact: true })).toHaveAttribute('aria-current', 'step')
        await expect(bar.getByRole('button', { name: 'Identité (faite)' })).toBeVisible() // remplie et passée
        await expect(bar.getByRole('button', { name: 'Modèle (faite)' })).toBeVisible()
        await bar.getByRole('button', { name: 'Formation' }).click()
      } else {
        const sel = page.getByRole('combobox', { name: guide.fr.stepsLabel })
        await expect(sel.locator('option:checked')).toHaveText(/Profil/)
        await expect(sel.locator('option', { hasText: 'Identité (faite)' })).toHaveCount(1)
        await sel.selectOption({ label: '05 Formation' })
      }
      await expect(title).toHaveText('Formation')
      await expect(page.getByText('Étape 5 sur 9').first()).toBeAttached()
    })

    test(`[C02] guidé : bascule en Complet puis retour garde l'étape et les données (${vp.name})`, async ({ page }) => {
      await page.goto('/#/editeur')
      await page.getByRole('button', { name: guide.fr.next }).click()
      await page.getByLabel('Prénom').fill('Zoé')
      await page.getByRole('button', { name: guide.fr.next }).click()
      await page.getByRole('button', { name: 'Complet' }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
      await page.getByRole('button', { name: 'Guidé' }).click()
      await expect(page.locator('#step-title')).toHaveText('Profil')
    })

    test(`[C03] guidé étape Modèle : choisir un modèle, annonce vocale, stockage, filtres, flèches (${vp.name})`, async ({ page }) => {
      await page.goto('/#/editeur')
      const gallery = page.getByRole('group', { name: v2.fr.models, exact: true })
      const btn = gallery.getByRole('button', { name: 'Minimal · Gouttière' })
      await btn.click()
      await expect(btn).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByRole('status').filter({ hasText: 'Modèle Minimal · Gouttière appliqué' })).toBeAttached()
      await expect(page.getByText('Modèle choisi : Minimal · Gouttière')).toBeVisible()
      // un modèle choisi sur un CV encore vierge crée le document (choix de design = première saisie)
      await poll(page, (d) => d.design.templateId).toMatch(/^minimal/)
      // filtres : la catégorie réduit la grille, Tous la rétablit
      const items = gallery.locator('ul > li')
      const all = await items.count()
      const cat = gallery.getByRole('group', { name: v2.fr.category })
      await cat.getByRole('button', { name: v2.fr.cats.creatif }).click()
      expect(await items.count()).toBeLessThan(all)
      await cat.getByRole('button', { name: v2.fr.all }).click()
      expect(await items.count()).toBe(all)
      // clavier : une seule tabulation, les flèches déplacent le focus
      await gallery.getByRole('button', { name: 'Minimal · Gouttière' }).focus()
      const idx = await gallery.locator('ul button').evaluateAll((bs) => bs.findIndex((b) => b === document.activeElement))
      await page.keyboard.press('ArrowRight')
      expect(await gallery.locator('ul button').evaluateAll((bs) => bs.findIndex((b) => b === document.activeElement))).toBe(idx + 1)
      await page.keyboard.press('ArrowLeft')
      expect(await gallery.locator('ul button').evaluateAll((bs) => bs.findIndex((b) => b === document.activeElement))).toBe(idx)
    })

    test(`[C04] guidé : ajouter une section d'une étape (masquer, afficher, supprimer, + Profil) (${vp.name})`, async ({ page }) => {
      await page.goto('/#/editeur')
      await page.getByRole('button', { name: guide.fr.next }).click() // Identité
      await page.getByLabel('Prénom').fill('Zoé')
      await page.getByRole('button', { name: guide.fr.next }).click() // Profil
      // le CV vierge a déjà ses sections : on masque, affiche, supprime, puis on la rajoute par le bouton d'ajout de l'étape
      await poll(page, (d) => kinds(d)).toContain('profile') // enregistré avec le prénom

      await page.getByRole('button', { name: 'Masquer la section Profil' }).click()
      await poll(page, (d) => d.data.sections.find((s: any) => s.kind === 'profile').visible).toBe(false)
      await page.getByRole('button', { name: 'Afficher la section Profil' }).click()
      await poll(page, (d) => d.data.sections.find((s: any) => s.kind === 'profile').visible).toBe(true)
      await expect(page.getByRole('button', { name: '+ Profil' })).toHaveCount(0) // déjà présent : plus proposé
      await page.getByRole('button', { name: 'Supprimer la section Profil' }).click()
      await poll(page, (d) => kinds(d).includes('profile')).toBe(false)
      await page.getByRole('button', { name: '+ Profil' }).click()
      await poll(page, (d) => kinds(d).includes('profile')).toBe(true)
      await expect(page.getByRole('button', { name: '+ Profil' })).toHaveCount(0)
    })

    test(`[C05] guidé étape Télécharger : récapitulatif, PDF, JSON, lettre assortie, Mes documents, Tout effacer (${vp.name})`, async ({ page }) => {
      await page.goto('/#/editeur')
      await page.getByRole('button', { name: ui.fr.samples.dev }).click()
      await expect(page.getByRole('button', { name: guide.fr.next })).toBeVisible()
      for (let i = 0; i < 8; i++) await page.getByRole('button', { name: guide.fr.next }).click()
      await expect(page.locator('#step-title')).toHaveText('Télécharger')
      await expect(page.getByRole('button', { name: guide.fr.next })).toHaveCount(0)
      await expect(page.getByRole('button', { name: guide.fr.skip })).toHaveCount(0)
      const main = page.locator('section[aria-labelledby="step-title"]') // le corps de l'étape (sur mobile, <main> contient aussi le menu Fichier)
      await expect(main.getByText('Camille Marchand').first()).toBeVisible() // récapitulatif
      // PDF depuis le corps de l'étape
      const [pdf] = await Promise.all([page.waitForEvent('download'), main.getByRole('button', { name: ui.fr.download }).click()])
      expect(pdf.suggestedFilename()).toBe('CV-Camille-Marchand.pdf')
      expect((await pdfOf((await pdf.path())!)).text).toContain('Camille')
      await expect(page.getByRole('status').filter({ hasText: 'PDF téléchargé' })).toBeAttached()
      // JSON
      const [js] = await Promise.all([page.waitForEvent('download'), main.getByRole('button', { name: ui.fr.exportJson }).click()])
      expect(js.suggestedFilename()).toBe('cvlove.json')
      const parsed = JSON.parse(readFileSync((await js.path())!, 'utf8'))
      expect(parsed.app).toBe('cvlove')
      expect(parsed.documents[0].data.personal.firstName).toBe('Camille')
      // Tout effacer : refus puis accord
      page.once('dialog', (d) => { expect(d.message()).toBe(ui.fr.clearConfirm); void d.dismiss() })
      await main.getByRole('button', { name: ui.fr.clearAll }).click()
      await poll(page, (d) => d.data.personal.firstName).toBe('Camille')
      page.once('dialog', (d) => void d.accept())
      await main.getByRole('button', { name: ui.fr.clearAll }).click()
      await poll(page, (d) => d.data.personal.firstName).toBe('')
      // lettre assortie
      await main.getByRole('button', { name: letterUi.fr.matching }).click()
      await expect(page).toHaveURL(/#\/lettre$/)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lettre de motivation')
      await poll(page, (d) => d.kind).toBe('letter')
      // Mes documents (depuis le guidé de la lettre, étape Télécharger)
      await page.goto('/#/editeur')
      for (let i = 0; i < 8; i++) await page.getByRole('button', { name: guide.fr.next }).click()
      await main.getByRole('link', { name: guide.fr.docsLink }).click()
      await expect(page).toHaveURL(/#\/documents$/)
    })

    test(`[C06] guidé : étapes Autres sections (+ Projets, + Section libre), Compétences (niveau), Design (couleur, police) (${vp.name})`, async ({ page }) => {
      await page.goto('/#/editeur')
      const title = page.locator('#step-title')
      await page.getByRole('button', { name: guide.fr.next }).click() // Identité
      await page.getByLabel('Prénom').fill('Zoé')
      await poll(page, (d) => d.data.personal.firstName).toBe('Zoé')
      const go = async (n: number) => { for (let i = 0; i < n; i++) await page.getByRole('button', { name: guide.fr.next }).click() }
      await go(4) // Compétences et langues
      await expect(title).toHaveText('Compétences et langues')
      await page.getByRole('button', { name: `+ ${ui.fr.addItem}` }).first().click()
      await page.getByRole('combobox', { name: v2.fr.level }).first().selectOption('3')
      await poll(page, (d) => d.data.sections.find((x: any) => x.kind === 'skills').items.some((i: any) => i.level === 3)).toBe(true)
      await go(1) // Autres sections
      await expect(title).toHaveText('Autres sections')
      await page.getByRole('button', { name: `+ ${ui.fr.kinds.projects}` }).click()
      await poll(page, (d) => kinds(d).includes('projects')).toBe(true)
      await expect(page.getByRole('button', { name: `+ ${ui.fr.kinds.projects}` })).toHaveCount(0)
      await page.getByRole('button', { name: `+ ${ui.fr.kinds.custom}` }).click()
      await poll(page, (d) => kinds(d).includes('custom')).toBe(true)
      await expect(page.getByRole('button', { name: `+ ${ui.fr.kinds.custom}` })).toBeVisible() // une section libre se rajoute toujours
      await go(1) // Design
      await expect(title).toHaveText('Design')
      const target = (await active(page)).design.accent === ACCENTS[4] ? 5 : 4
      await page.getByRole('button', { name: extra.fr.colors[target], exact: true }).click()
      await poll(page, (d) => d.design.accent).toBe(ACCENTS[target])
      await page.getByRole('combobox', { name: v2.fr.font }).selectOption('lora')
      await poll(page, (d) => d.design.fontPair).toBe('lora')
    })

    // =============== D. ÉDITEUR COMPLET : identité, photo, champs ===============

    test(`[D01] complet : langue du CV (en, ar) change les titres de section sans toucher au texte (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      const lang = page.getByRole('combobox', { name: ui.fr.cvLang }).first()
      await lang.selectOption('en')
      await expect(page.locator('h3').filter({ hasText: 'Education' })).toBeVisible()
      await expect(page.getByLabel('Prénom')).toHaveValue('Camille')
      await poll(page, (d) => d.data.lang).toBe('en')
      await lang.selectOption('ar')
      await poll(page, (d) => d.data.lang).toBe('ar')
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr') // la langue du CV n'est pas celle de l'interface
    })

    test(`[D02] complet : Ajouter une photo / Retirer la photo, refus d'un fichier illisible ou trop gros (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      const input = page.locator('input[type=file][accept="image/*"]')
      await input.setInputFiles({ name: 'p.png', mimeType: 'image/png', buffer: png() })
      await expect(page.locator('img[src^="data:image/jpeg"]')).toBeVisible()
      await poll(page, (d) => d.data.personal.photo).toMatch(/^data:image\/jpeg/)
      await expect(page.getByRole('button', { name: ui.fr.photo, exact: true })).toBeVisible() // « Photo » : on peut la remplacer
      await page.getByRole('button', { name: ui.fr.removePhoto }).click()
      await poll(page, (d) => d.data.personal.photo).toBe('')
      await expect(page.getByRole('button', { name: ui.fr.addPhoto })).toBeFocused()
      await input.setInputFiles({ name: 'p.png', mimeType: 'image/png', buffer: Buffer.from('pas une image') })
      await expect(page.getByRole('alert').filter({ hasText: extra.fr.photoError })).toBeVisible()
      await input.setInputFiles({ name: 'g.png', mimeType: 'image/png', buffer: Buffer.alloc(15_000_001) })
      await expect(page.getByRole('alert').filter({ hasText: 'Fichier trop volumineux' })).toBeVisible()
      expect((await active(page)).data.personal.photo).toBe('')
    })

    test(`[D03] complet : la photo ajoutée est dans le PDF, retirée elle n'y est plus (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      await page.locator('input[type=file][accept="image/*"]').setInputFiles({ name: 'p.png', mimeType: 'image/png', buffer: png() })
      await expect(page.locator('img[src^="data:image/jpeg"]')).toBeVisible()
      const withPhoto = await pdfOf((await (await download(page)).path())!)
      expect(withPhoto.images).toBeGreaterThan(0)
      await page.getByRole('button', { name: ui.fr.removePhoto }).click()
      const without = await pdfOf((await (await download(page)).path())!)
      expect(without.images).toBe(0)
    })

    test(`[D04] complet : champs de contact (+ Champ libre, Masquer / Afficher, Supprimer) (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      const n0 = (await active(page)).data.personal.fields.length
      await page.getByRole('button', { name: `+ ${ui.fr.addCustomField}` }).click()
      await poll(page, (d) => d.data.personal.fields.length).toBe(n0 + 1)
      const name = ui.fr.customLabel
      await page.getByRole('button', { name: `Masquer : ${name}` }).click()
      await poll(page, (d) => d.data.personal.fields.at(-1).visible).toBe(false)
      await page.getByRole('button', { name: `Afficher : ${name}` }).click()
      await poll(page, (d) => d.data.personal.fields.at(-1).visible).toBe(true)
      await page.getByRole('button', { name: `Supprimer : ${name}` }).click()
      await poll(page, (d) => d.data.personal.fields.length).toBe(n0)
      // le focus passe à un champ voisin au lieu de retomber sur la page
      expect(await page.evaluate(() => document.activeElement?.tagName)).toMatch(/INPUT|SELECT|TEXTAREA/)
      // + champ standard manquant (la date de naissance n'est pas dans l'exemple) puis suppression
      const miss = page.getByRole('button', { name: `+ ${ui.fr.birthDate}` })
      if (await miss.count()) {
        await miss.click()
        await poll(page, (d) => d.data.personal.fields.some((f: any) => f.kind === 'birthDate')).toBe(true)
      }
    })

    // =============== E. ÉDITEUR COMPLET : sections et éléments ===============

    test(`[E01] complet : Ajouter une section (menu des types), focus rendu au bouton (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé') // enregistre le CV vierge
      await poll(page, (d) => d.data.personal.firstName).toBe('Zoé')
      const before = (await active(page)).data.sections.length
      await page.getByRole('button', { name: `+ ${ui.fr.addSection}` }).click()
      const pick = page.getByRole('button', { name: `+ ${ui.fr.kinds.custom}` })
      await expect(pick).toBeVisible()
      await expect(page.getByRole('button', { name: `+ ${ui.fr.kinds.projects}` })).toBeFocused().catch(() => {}) // le 1er type reçoit le focus
      await pick.click()
      await poll(page, (d) => d.data.sections.length).toBe(before + 1)
      await expect(page.getByRole('button', { name: `+ ${ui.fr.addSection}` })).toBeFocused()
      // une section déjà présente ne se propose plus
      await page.getByRole('button', { name: `+ ${ui.fr.addSection}` }).click()
      const present = (await active(page)).data.sections.filter((s: any) => s.kind !== 'custom').map((s: any) => s.kind)
      for (const k of present) await expect(page.getByRole('button', { name: `+ ${(ui.fr.kinds as any)[k]}`, exact: true })).toHaveCount(0)
    })

    test(`[E02] complet : monter / descendre / masquer / supprimer une section (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      const k0: string[] = kinds(await active(page))
      expect(k0.length).toBeGreaterThan(3)
      const nm = (k: string) => (cvLabels.fr.sections as any)[k] as string
      // le 1er « Monter » est désactivé, le dernier « Descendre » aussi
      await expect(page.getByRole('button', { name: `Monter la section ${nm(k0[0])}` })).toBeDisabled()
      await expect(page.getByRole('button', { name: `Descendre la section ${nm(k0.at(-1)!)}` })).toBeDisabled()
      // monter la 2e : échange avec la 1re, le focus reste sur le bouton
      const up = page.getByRole('button', { name: `Monter la section ${nm(k0[1])}` })
      await up.click()
      await poll(page, kinds).toEqual([k0[1], k0[0], ...k0.slice(2)])
      // elle est maintenant première : son « Monter » se désactive, le focus passe à « Descendre » (pas sur body)
      await expect(page.getByRole('button', { name: `Descendre la section ${nm(k0[1])}` })).toBeFocused()
      // descendre la section maintenant en tête
      await page.getByRole('button', { name: `Descendre la section ${nm(k0[1])}` }).click()
      await poll(page, kinds).toEqual(k0)
      await expect(page.getByRole('button', { name: `Descendre la section ${nm(k0[1])}` })).toBeFocused() // garde le focus
      // masquer / afficher
      const hide = page.getByRole('button', { name: `Masquer la section ${nm(k0[1])}` })
      await hide.click()
      await poll(page, (d) => d.data.sections[1].visible).toBe(false)
      await expect(sectionLi(page, new RegExp(nm(k0[1]))).getByText('(masquée)')).toBeVisible()
      await page.getByRole('button', { name: `Afficher la section ${nm(k0[1])}` }).click()
      await poll(page, (d) => d.data.sections[1].visible).toBe(true)
      // supprimer : la section disparaît, le focus va au titre de la suivante
      await page.getByRole('button', { name: `Supprimer la section ${nm(k0[1])}` }).click()
      await poll(page, kinds).toEqual([k0[0], ...k0.slice(2)])
      await expect(page.getByRole('heading', { level: 3, name: new RegExp(nm(k0[2])) })).toBeFocused()
    })

    test(`[E03] complet : masquer une section change l'aperçu (${vp.name})`, async ({ page }) => {
      test.skip(!vp.wide, 'aperçu côte à côte : vérifié sur bureau, le mobile nécessite l’onglet Aperçu')
      await edit(page, { sample: true })
      await previewChanges(page, () => page.getByRole('button', { name: 'Masquer la section Expérience' }).click())
    })

    test(`[E04] complet : éléments d'une section (+ élément, monter, descendre, supprimer) (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      const sec = sectionLi(page, 'Expérience')
      const idx = async () => (await active(page)).data.sections.findIndex((s: any) => s.kind === 'experience')
      const titles = async () => (await active(page)).data.sections[await idx()].items.map((i: any) => i.title)
      const t0: string[] = await titles()
      expect(t0.length).toBeGreaterThanOrEqual(2)
      const first = sec.getByRole('button', { name: /^Monter : / }).first()
      await expect(first).toBeDisabled()
      await sec.getByRole('button', { name: /^Descendre : / }).first().click()
      await expect.poll(titles).toEqual([t0[1], t0[0], ...t0.slice(2)])
      await sec.getByRole('button', { name: /^Monter : / }).nth(1).click()
      await expect.poll(titles).toEqual(t0)
      await sec.getByRole('button', { name: `+ ${ui.fr.addItem}` }).click()
      await expect.poll(async () => (await titles()).length).toBe(t0.length + 1)
      await sec.getByRole('button', { name: /^Supprimer : / }).last().click()
      await expect.poll(async () => (await titles()).length).toBe(t0.length)
      expect(await titles()).toEqual(t0)
    })

    test(`[E05] complet : titre, niveau, dates, « En cours » d'un élément (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      const exp = sectionLi(page, 'Expérience')
      await exp.getByLabel('Titre de la section').fill('Mon parcours')
      await poll(page, (d) => d.data.sections.find((s: any) => s.kind === 'experience').title).toBe('Mon parcours')
      await expect(page.getByRole('heading', { level: 3, name: 'Mon parcours' })).toBeVisible()
      // dates : une seule saisie, normalisée en sortie de champ
      const li = sectionLi(page, 'Mon parcours').locator('li').first()
      const start = li.getByLabel(ui.fr.start, { exact: true })
      await start.fill('3.18')
      await start.blur()
      await expect(start).toHaveValue('03/2018')
      await poll(page, (d) => d.data.sections.find((s: any) => s.kind === 'experience').items[0].start).toBe('2018-03')
      await start.fill('2018')
      await start.press('Enter')
      await expect(start).toHaveValue('2018')
      await poll(page, (d) => d.data.sections.find((s: any) => s.kind === 'experience').items[0].start).toBe('2018')
      // En cours : désactive la fin
      const end = li.getByLabel(ui.fr.end, { exact: true })
      const cur = li.getByRole('checkbox', { name: ui.fr.current })
      if (await cur.isChecked()) await cur.uncheck()
      await expect(end).toBeEnabled()
      await cur.check()
      await expect(end).toBeDisabled()
      await poll(page, (d) => d.data.sections.find((s: any) => s.kind === 'experience').items[0].current).toBe(true)
      // niveau d'une compétence
      const sk = sectionLi(page, 'Compétences')
      await sk.getByRole('combobox', { name: v2.fr.level }).first().selectOption('4')
      await poll(page, (d) => d.data.sections.find((s: any) => s.kind === 'skills').items[0].level).toBe(4)
    })

    // =============== F. DESIGN ===============

    test(`[F01] design : couleur (pastille, couleur libre), annonce vocale, stockage, aperçu (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await openDesign(page)
      const cur = (await active(page)).design.accent
      const target = ACCENTS.indexOf(cur) === 2 ? 3 : 2
      const swatch = page.getByRole('button', { name: extra.fr.colors[target], exact: true })
      if (vp.wide) await previewChanges(page, () => swatch.click())
      else await swatch.click()
      await expect(swatch).toHaveAttribute('aria-pressed', 'true')
      await poll(page, (d) => d.design.accent).toBe(ACCENTS[target])
      await expect(page.getByRole('status').filter({ hasText: `Couleur ${extra.fr.colors[target]} appliquée` })).toBeAttached()
      await page.locator('input[type=color]').fill('#0e7490')
      await poll(page, (d) => d.design.accent).toBe('#0e7490')
    })

    test(`[F02] design : police, taille du texte, interligne (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await openDesign(page)
      await page.getByRole('combobox', { name: v2.fr.font }).selectOption('playfair')
      await poll(page, (d) => d.design.fontPair).toBe('playfair')
      const [size, lh] = [page.getByRole('slider').nth(0), page.getByRole('slider').nth(1)]
      await size.fill('1.1')
      await poll(page, (d) => d.design.fontScale).toBe(1.1)
      await expect(size).toHaveAttribute('aria-valuetext', '110 %')
      await lh.fill('1.4')
      await poll(page, (d) => d.design.lineHeight).toBe(1.4)
      await expect(lh).toHaveAttribute('aria-valuetext', '1.40')
    })

    test(`[F03] design : marges, format, forme de photo (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await openDesign(page)
      const seg = (label: string, name: string) => page.getByRole('group', { name: label, exact: true }).getByRole('button', { name, exact: true })
      await seg(v2.fr.margins, v2.fr.marginOpts.large).click()
      await poll(page, (d) => d.design.margins).toBe('large')
      await expect(seg(v2.fr.margins, v2.fr.marginOpts.large)).toHaveAttribute('aria-pressed', 'true')
      await seg(v2.fr.margins, v2.fr.marginOpts.compact).click()
      await poll(page, (d) => d.design.margins).toBe('compact')
      await seg(v2.fr.pageSize, 'Letter').click()
      await poll(page, (d) => d.design.pageSize).toBe('LETTER')
      await seg(v2.fr.pageSize, 'A4').click()
      await poll(page, (d) => d.design.pageSize).toBe('A4')
      await seg(v2.fr.photoShape, v2.fr.shapes.square).click()
      await poll(page, (d) => d.design.photoShape).toBe('square')
      await seg(v2.fr.photoShape, v2.fr.shapes.circle).click()
      await poll(page, (d) => d.design.photoShape).toBe('circle')
    })

    test(`[F04] design : affichage des niveaux Texte / Barres / Points, vu dans le PDF (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await openDesign(page)
      const seg = (name: string) => page.getByRole('group', { name: v2.fr.skillDisplay, exact: true }).getByRole('button', { name, exact: true })
      const hasLevelWords = async () => {
        const text = (await pdfOf((await (await download(page)).path())!)).text
        return cvLabels.fr.levels.some((l) => text.includes(l))
      }
      await seg(v2.fr.displays.text).click()
      await poll(page, (d) => d.design.skillDisplay).toBe('text')
      expect(await hasLevelWords(), 'mode Texte : les niveaux s’écrivent').toBe(true)
      await seg(v2.fr.displays.bars).click()
      await poll(page, (d) => d.design.skillDisplay).toBe('bars')
      await seg(v2.fr.displays.dots).click()
      await poll(page, (d) => d.design.skillDisplay).toBe('dots')
    })

    test(`[F05] design : police, couleur et format se retrouvent dans le PDF (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await openDesign(page)
      await page.getByRole('combobox', { name: v2.fr.font }).selectOption('playfair')
      await page.locator('input[type=color]').fill('#0e7490')
      await page.getByRole('group', { name: v2.fr.pageSize, exact: true }).getByRole('button', { name: 'Letter' }).click()
      const path = (await (await download(page)).path())!
      expect(readFileSync(path).toString('latin1').includes('CVLoveDisplay')).toBe(true)
      expect((await pdfOf(path)).view).toEqual([612, 792])
    })

    test(`[F06] design : choisir un modèle en mode complet (annonce, stockage, aperçu), filtres du catalogue (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await openDesign(page)
      const gallery = page.getByRole('group', { name: v2.fr.models, exact: true })
      const before = (await active(page)).design.templateId
      const btn = gallery.getByRole('button', { name: 'Minimal · Gouttière' })
      if (vp.wide) await previewChanges(page, () => btn.click())
      else await btn.click()
      await expect(btn).toHaveAttribute('aria-pressed', 'true')
      await poll(page, (d) => d.design.templateId).not.toBe(before)
      await expect(page.getByRole('status').filter({ hasText: 'Modèle Minimal · Gouttière appliqué' })).toBeAttached()
      // photo + colonnes : jusqu'à n'avoir plus aucun modèle, le message le dit
      await gallery.getByRole('group', { name: v2.fr.photoFilter }).getByRole('button', { name: v2.fr.withPhoto }).click()
      const n = await gallery.locator('ul > li').count()
      await gallery.getByRole('group', { name: v2.fr.columns }).getByRole('button', { name: v2.fr.oneCol }).click()
      expect(await gallery.locator('ul > li').count()).toBeLessThanOrEqual(n)
      await gallery.getByRole('group', { name: v2.fr.category }).getByRole('button', { name: v2.fr.cats.simple }).click()
      await gallery.getByRole('group', { name: v2.fr.photoFilter }).getByRole('button', { name: v2.fr.all }).click()
      await gallery.getByRole('group', { name: v2.fr.columns }).getByRole('button', { name: v2.fr.all }).click()
      expect(await gallery.locator('ul > li').count()).toBeGreaterThan(0)
    })

    // =============== G. DONNÉES : exemple, effacer, menu Fichier ===============

    test(`[G01] complet : exemple (bandeau, « Partir d'une page vide »), Tout effacer (refus/accord), Remplir avec l'exemple (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await expect(page.getByText(/Ce document contient l’exemple de Camille/)).toBeVisible()
      page.once('dialog', (d) => void d.dismiss())
      await page.getByRole('button', { name: extra.fr.startEmpty }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('Camille') // refusé : rien ne change
      page.once('dialog', (d) => void d.accept())
      await page.getByRole('button', { name: extra.fr.startEmpty }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('')
      await poll(page, (d) => d.data.personal.firstName).toBe('')
      await expect(page.getByRole('group', { name: ui.fr.sampleIntro })).toBeVisible()
      // « Remplir avec l'exemple » sur un document vide : direct
      await page.getByRole('button', { name: ui.fr.loadSample }).click()
      await expect(page.getByLabel('Prénom')).not.toHaveValue('')
      // sur un CV personnel : confirmation
      await page.getByLabel('Prénom').fill('Zoé')
      await page.getByLabel('Nom', { exact: true }).fill('Durand')
      page.once('dialog', (d) => { expect(d.message()).toBe(ui.fr.clearConfirm); void d.dismiss() })
      await page.getByRole('button', { name: ui.fr.loadSample }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
      page.once('dialog', (d) => void d.accept())
      await page.getByRole('button', { name: ui.fr.loadSample }).click()
      await expect(page.getByLabel('Prénom')).not.toHaveValue('Zoé')
      // Tout effacer
      page.once('dialog', (d) => void d.dismiss())
      await page.getByRole('button', { name: ui.fr.clearAll }).click()
      await expect(page.getByLabel('Prénom')).not.toHaveValue('')
      page.once('dialog', (d) => void d.accept())
      await page.getByRole('button', { name: ui.fr.clearAll }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('')
      await expect(page.getByRole('button', { name: `+ ${ui.fr.addSection}` })).toBeVisible()
    })

    test(`[G02] menu Fichier : ouvrir, Exporter (JSON), Échap referme et rend le focus (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      const summary = page.locator('summary', { hasText: v2.fr.file })
      await summary.click()
      const exp = page.getByRole('button', { name: ui.fr.exportJson })
      await expect(exp).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(exp).toBeHidden()
      await expect(summary).toBeFocused()
      await summary.click()
      const [d] = await Promise.all([page.waitForEvent('download'), exp.click()])
      expect(d.suggestedFilename()).toMatch(/\.json$/)
      const j = JSON.parse(readFileSync((await d.path())!, 'utf8'))
      expect(j.app).toBe('cvlove')
      expect(j.documents).toHaveLength(1)
      expect(j.documents[0].data.personal.firstName).toBe('Zoé')
      await expect(exp).toBeHidden() // le menu se referme après l'export
      await expect(summary).toBeFocused()
    })

    test(`[G03] menu Fichier : Importer sur un document vide ajoute directement (${vp.name})`, async ({ page }) => {
      await edit(page)
      const src = await page.evaluate(() => null)
      void src
      await page.locator('#imp').setInputFiles(jsonFile([{ id: 'imp1', kind: 'cv', name: 'Importé', updatedAt: 1, editorMode: 'full',
        data: { lang: 'fr', personal: { firstName: 'Ines', lastName: 'Roux', title: '', photo: '', fields: [] }, sections: [] },
        design: { templateId: 'classique-1', accent: '#1d4ed8', fontPair: 'inter', fontScale: 1, lineHeight: 1.4, margins: 'normal', pageSize: 'A4', photoShape: 'circle', skillDisplay: 'text' } }]))
      await expect(page.getByLabel('Prénom')).toHaveValue('Ines')
      await expect(page.getByRole('status').filter({ hasText: extra.fr.fileImported })).toBeVisible()
      await poll(page, (d) => d.data.personal.firstName).toBe('Ines')
    })

    test(`[G04] boîte d'import sur un CV rempli : Ajouter, Remplacer, Annuler, Échap (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      await page.locator('summary', { hasText: v2.fr.file }).click()
      const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: ui.fr.exportJson }).click()])
      const file = { name: 'cvlove.json', mimeType: 'application/json', buffer: readFileSync((await d.path())!) }
      const ask = page.getByRole('dialog', { name: v2.fr.importTitle })
      await page.getByLabel('Prénom').fill('Bob')
      await poll(page, (x) => x.data.personal.firstName).toBe('Bob')
      // Annuler : rien ne change, focus rendu au menu
      await page.locator('#imp').setInputFiles(file)
      await expect(ask.getByRole('button', { name: v2.fr.importAdd })).toBeFocused()
      await ask.getByRole('button', { name: letterUi.fr.cancel }).click()
      await expect(ask).toBeHidden()
      await expect(page.getByLabel('Prénom')).toHaveValue('Bob')
      expect(await docsOf(page)).toHaveLength(1)
      await expect(page.locator('summary', { hasText: v2.fr.file })).toBeFocused()
      // Échap = annuler
      await page.locator('#imp').setInputFiles(file)
      await expect(ask).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(ask).toBeHidden()
      await expect(page.getByLabel('Prénom')).toHaveValue('Bob')
      // Remplacer : le document en cours reprend le contenu du fichier, sans nouveau document
      await page.locator('#imp').setInputFiles(file)
      await ask.getByRole('button', { name: /^Remplacer/ }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
      await poll(page, (x) => x.data.personal.firstName).toBe('Zoé')
      expect(await docsOf(page)).toHaveLength(1)
      await expect(page.getByRole('status').filter({ hasText: extra.fr.fileImported })).toBeVisible()
      // Ajouter : un second document, ouvert
      await page.getByLabel('Prénom').fill('Bob')
      await page.locator('#imp').setInputFiles(file)
      await ask.getByRole('button', { name: v2.fr.importAdd }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
      await expect.poll(async () => (await docsOf(page)).length).toBe(2)
    })

    test(`[G05] menu Fichier : un fichier illisible affiche une alerte et ne change rien (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      await page.locator('#imp').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{pas du json') })
      await expect(page.getByRole('alert').filter({ hasText: ui.fr.importError })).toBeVisible()
      await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
      await page.locator('#imp').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.alloc(5_000_001, 32) })
      await expect(page.getByRole('alert').filter({ hasText: 'Fichier trop volumineux' })).toBeVisible()
      await expect.poll(async () => (await docsOf(page)).length).toBe(1)
    })

    // =============== H. MES DOCUMENTS ===============

    test(`[H01] Mes documents : Nouveau CV, Ouvrir, Dupliquer, Renommer (Entrée, Échap), Exporter, Supprimer (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      await poll(page, (d) => d.data.personal.firstName).toBe('Zoé')
      await page.getByRole('banner').getByRole('link', { name: v2.fr.docs }).click()
      const rows = page.locator('li[data-doc]')
      await expect(rows).toHaveCount(1)
      await expect(rows.first()).toContainText(v2.fr.active)
      // Dupliquer : copie ouverte, annonce
      await page.getByRole('button', { name: 'Dupliquer : Zoé' }).click()
      await expect(rows).toHaveCount(2)
      await expect(page.getByRole('status').filter({ hasText: 'Zoé 2 dupliqué' })).toBeVisible()
      await expect.poll(async () => (await docsOf(page)).length).toBe(2)
      // Renommer : Entrée valide, le focus revient au bouton
      await page.getByRole('button', { name: 'Renommer : Zoé 2' }).click()
      const input = page.getByLabel(v2.fr.renameLabel)
      await expect(input).toBeFocused()
      await input.fill('Candidature Lyon')
      await input.press('Enter')
      await expect(page.locator('li[data-doc="Candidature Lyon"]')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Renommer : Candidature Lyon' })).toBeFocused()
      await expect.poll(async () => (await docsOf(page)).map((d) => d.name)).toContain('Candidature Lyon')
      // Renommer : Échap annule
      await page.getByRole('button', { name: 'Renommer : Candidature Lyon' }).click()
      await page.getByLabel(v2.fr.renameLabel).fill('Autre nom')
      await page.getByLabel(v2.fr.renameLabel).press('Escape')
      await expect(page.locator('li[data-doc="Candidature Lyon"]')).toBeVisible()
      await expect(page.locator('li[data-doc="Autre nom"]')).toHaveCount(0)
      // Renommer : un nom vide revient à « CV »
      await page.getByRole('button', { name: 'Renommer : Candidature Lyon' }).click()
      await page.getByLabel(v2.fr.renameLabel).fill('   ')
      await page.getByLabel(v2.fr.renameLabel).press('Enter')
      await expect(page.locator('li[data-doc="CV"]')).toBeVisible()
      // Exporter un document
      const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: `${ui.fr.exportJson} : Zoé` }).click()])
      expect(d.suggestedFilename()).toBe('Zoé.json')
      expect(JSON.parse(readFileSync((await d.path())!, 'utf8')).documents).toHaveLength(1)
      // Ouvrir
      await page.getByRole('button', { name: 'Ouvrir : Zoé', exact: true }).click()
      await expect(page).toHaveURL(/#\/editeur$/)
      await page.getByRole('button', { name: 'Complet' }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
      // Supprimer : refus puis accord, focus au titre
      await page.getByRole('banner').getByRole('link', { name: v2.fr.docs }).click()
      page.once('dialog', (x) => { expect(x.message()).toContain('« CV »'); void x.dismiss() })
      await page.getByRole('button', { name: 'Supprimer : CV', exact: true }).click()
      await expect(rows).toHaveCount(2)
      page.once('dialog', (x) => void x.accept())
      await page.getByRole('button', { name: 'Supprimer : CV', exact: true }).click()
      await expect(rows).toHaveCount(1)
      await expect(page.locator('h1')).toBeFocused()
      await expect.poll(async () => (await docsOf(page)).length).toBe(1)
    })

    test(`[H02] Mes documents : supprimer le dernier document ne laisse que le CV vierge, invisible (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      await poll(page, (d) => d.data.personal.firstName).toBe('Zoé')
      await page.goto('/#/documents')
      page.once('dialog', (x) => void x.accept())
      await page.getByRole('button', { name: 'Supprimer : Zoé' }).click()
      await expect(page.locator('li[data-doc]')).toHaveCount(0)
      await expect.poll(async () => (await docsOf(page)).length).toBe(0)
    })

    test(`[H03] Mes documents : Nouveau CV, Tout exporter, Importer (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      await poll(page, (d) => d.data.personal.firstName).toBe('Zoé')
      await page.goto('/#/documents')
      // Tout exporter
      const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: v2.fr.exportAll }).click()])
      expect(d.suggestedFilename()).toBe('cvlove-documents.json')
      const all = readFileSync((await d.path())!)
      expect(JSON.parse(all.toString('utf8')).documents).toHaveLength(1)
      // Nouveau CV : ouvre l'éditeur sur un CV vierge, sans nouvelle ligne tant qu'il est vide
      await page.getByRole('button', { name: v2.fr.newCV }).click()
      await expect(page).toHaveURL(/#\/editeur$/)
      await page.getByRole('button', { name: 'Complet' }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('')
      await page.goto('/#/documents')
      await expect(page.locator('li[data-doc]')).toHaveCount(1)
      // Importer : ajoute, annonce, ouvre le premier document ajouté
      await page.locator('input[type=file][accept^="application/json"]').setInputFiles({ name: 'cvlove-documents.json', mimeType: 'application/json', buffer: all })
      await expect(page.getByRole('status').filter({ hasText: '1 document importé.' })).toBeVisible()
      await expect(page.locator('li[data-doc]')).toHaveCount(2)
      // fichier illisible
      await page.locator('input[type=file][accept^="application/json"]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('nope') })
      await expect(page.getByRole('alert').filter({ hasText: v2.fr.importError })).toBeVisible()
      await expect(page.locator('li[data-doc]')).toHaveCount(2)
    })

    test(`[H04] Mes documents : « Effacer toutes mes données » (refus, accord), lien Modifier, langue (${vp.name})`, async ({ page }) => {
      await edit(page)
      await page.getByLabel('Prénom').fill('Zoé')
      await poll(page, (d) => d.data.personal.firstName).toBe('Zoé')
      await page.goto('/#/documents')
      // lien Modifier
      await page.getByRole('link', { name: ui.fr.tabEdit }).click()
      await expect(page).toHaveURL(/#\/editeur$/)
      await page.goBack()
      // langue
      await page.getByLabel(ui.fr.uiLang).selectOption('en')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(v2.en.docs)
      await page.getByLabel(ui.en.uiLang).selectOption('fr')
      // Effacer : refus
      page.once('dialog', (x) => { expect(x.message()).toBe(v2.fr.wipeConfirm); void x.dismiss() })
      await page.getByRole('button', { name: v2.fr.wipeAll }).click()
      expect(await docsOf(page)).toHaveLength(1)
      // Effacer : accord, la page se recharge sans rien
      page.once('dialog', (x) => void x.accept())
      await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: v2.fr.wipeAll }).click()])
      await expect(page.locator('li[data-doc]')).toHaveCount(0)
      expect(await docsOf(page)).toEqual([]) // le démarrage réécrit un état vide, sans aucun document
      expect(await page.evaluate(() => localStorage.getItem('cvlove:corrupt'))).toBeNull()
    })

    // =============== I. LETTRE ===============

    test(`[I01] Mes documents : Nouvelle lettre (CV source, Partir de zéro, Annuler, Créer) (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await page.goto('/#/documents')
      const open = page.getByRole('button', { name: letterUi.fr.newLetter })
      await open.click()
      await expect(open).toHaveAttribute('aria-expanded', 'true')
      const form = page.getByRole('form', { name: letterUi.fr.newLetter })
      await expect(form.getByRole('combobox')).toBeFocused()
      await form.getByRole('button', { name: letterUi.fr.cancel }).click()
      await expect(form).toBeHidden()
      await open.click()
      await form.getByRole('button', { name: letterUi.fr.create }).click() // CV source = le CV d'exemple
      await expect(page).toHaveURL(/#\/lettre$/)
      await poll(page, (d) => d.kind).toBe('letter')
      expect((await active(page)).data.sender.name).toContain('Camille')
      // depuis zéro
      await page.goto('/#/documents')
      await page.getByRole('button', { name: letterUi.fr.newLetter }).click()
      await page.getByRole('form').getByRole('combobox').selectOption({ label: letterUi.fr.scratch })
      await page.getByRole('form').getByRole('button', { name: letterUi.fr.create }).click()
      await expect(page).toHaveURL(/#\/lettre$/)
      await expect.poll(async () => (await docsOf(page)).filter((d) => d.kind === 'letter').length).toBeGreaterThanOrEqual(1)
      // la lettre rouvre depuis la liste
      await page.goto('/#/documents')
      await expect(page.locator('li[data-doc]').filter({ hasText: v2.fr.kindLetter }).first()).toBeVisible()
    })

    test(`[I02] lettre : champs, exemple, mise en page, langue, PDF (${vp.name})`, async ({ page }) => {
      await page.goto('/#/documents')
      await page.getByRole('button', { name: letterUi.fr.newLetter }).click()
      await page.getByRole('form').getByRole('button', { name: letterUi.fr.create }).click()
      await expect(page).toHaveURL(/#\/lettre$/)
      await page.getByRole('button', { name: 'Complet' }).click()
      // lettre vide : pas de PDF blanc
      await dlBtn(page).click()
      await expect(page.getByRole('alert').filter({ hasText: extra.fr.emptyDownload })).toBeVisible()
      // exemple : remplit le corps
      await page.getByRole('button', { name: ui.fr.samples.dev }).click()
      await poll(page, (d) => d.data.body.length).toBeGreaterThan(50)
      await expect(page.getByRole('group', { name: ui.fr.sampleIntro })).toHaveCount(0) // plus proposé une fois rempli
      // champs
      await page.getByLabel(letterUi.fr.subject).fill('Candidature au poste de testeur')
      await poll(page, (d) => d.data.subject).toBe('Candidature au poste de testeur')
      await page.getByLabel(letterUi.fr.recName).fill('Mme Martin')
      await poll(page, (d) => d.data.recipient.name).toBe('Mme Martin')
      // mise en page
      const lay = page.getByRole('group', { name: letterUi.fr.layout, exact: true })
      const before = (await active(page)).design.templateId
      const other = lay.getByRole('button', { pressed: false }).first()
      await other.click()
      await poll(page, (d) => d.design.templateId).not.toBe(before)
      // langue de la lettre
      await page.getByRole('combobox', { name: letterUi.fr.letterLang }).first().selectOption('en')
      await poll(page, (d) => d.data.lang).toBe('en')
      // PDF
      const d = await download(page)
      expect(d.suggestedFilename()).toMatch(/^Lettre-.*\.pdf$/)
      expect((await pdfOf((await d.path())!)).text).toContain('Candidature au poste de testeur')
      await expect(page.getByRole('status').filter({ hasText: 'PDF téléchargé' })).toBeAttached()
    })

    test(`[I03] lettre guidée : étapes, Passer, Précédent, Télécharger, Mes documents (${vp.name})`, async ({ page }) => {
      await page.goto('/#/documents')
      await page.getByRole('button', { name: letterUi.fr.newLetter }).click()
      await page.getByRole('form').getByRole('button', { name: letterUi.fr.create }).click()
      const title = page.locator('#step-title')
      await expect(title).toHaveText('Expéditeur')
      await page.getByLabel(letterUi.fr.name).fill('Zoé Durand')
      await page.getByRole('button', { name: guide.fr.next }).click()
      await expect(title).toHaveText('Destinataire')
      await expect(title).toBeFocused()
      await page.getByRole('button', { name: guide.fr.skip }).click()
      await expect(title).toHaveText('Objet')
      await page.getByRole('button', { name: guide.fr.prev }).click()
      await expect(title).toHaveText('Destinataire')
      for (let i = 0; i < 4; i++) await page.getByRole('button', { name: guide.fr.next }).click()
      await expect(title).toHaveText('Télécharger')
      await page.getByLabel(letterUi.fr.name).count()
      const [d] = await Promise.all([page.waitForEvent('download'), page.locator('main').getByRole('button', { name: ui.fr.download }).click()])
      expect(d.suggestedFilename()).toBe('Lettre-Zoe-Durand.pdf')
      await page.locator('main').getByRole('link', { name: guide.fr.docsLink }).click()
      await expect(page).toHaveURL(/#\/documents$/)
    })


    test(`[G06] menu Fichier : un clic ailleurs referme le menu (${vp.name})`, async ({ page }) => {
      // BUG: le menu Fichier (<details>) reste ouvert après un clic en dehors
      await edit(page)
      await page.locator('summary', { hasText: v2.fr.file }).click()
      const exp = page.getByRole('button', { name: ui.fr.exportJson })
      await expect(exp).toBeVisible()
      await page.getByLabel('Prénom').click()
      await expect(exp).toBeHidden()
    })

    test(`[I04] lettre assortie depuis le formulaire complet, menu Fichier de la lettre, import d'un CV depuis la lettre, Ouvrir une lettre (${vp.name})`, async ({ page }) => {
      await edit(page, { sample: true })
      await page.getByRole('button', { name: letterUi.fr.matching }).click()
      await expect(page).toHaveURL(/#\/lettre$/)
      await poll(page, (d) => d.kind).toBe('letter')
      await page.getByRole('button', { name: 'Complet' }).click()
      await expect(page.getByLabel(letterUi.fr.name)).toHaveValue(/Camille/)
      // export de la lettre
      await page.locator('summary', { hasText: v2.fr.file }).click()
      const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: ui.fr.exportJson }).click()])
      const j = JSON.parse(readFileSync((await d.path())!, 'utf8'))
      expect(j.documents[0].kind).toBe('letter')
      // import d'un CV depuis la lettre : ajouté directement (types différents), l'éditeur de CV s'ouvre
      await page.locator('#imp').setInputFiles(jsonFile([{ id: 'cv9', kind: 'cv', name: 'Importé', updatedAt: 1, editorMode: 'full',
        data: { lang: 'fr', personal: { firstName: 'Ines', lastName: 'Roux', title: '', photo: '', fields: [] }, sections: [] },
        design: { templateId: 'classique-1', accent: '#1d4ed8', fontPair: 'inter', fontScale: 1, lineHeight: 1.4, margins: 'normal', pageSize: 'A4', photoShape: 'circle', skillDisplay: 'text' } }]))
      await expect(page).toHaveURL(/#\/editeur$/)
      await page.getByRole('button', { name: 'Complet' }).click()
      await expect(page.getByLabel('Prénom')).toHaveValue('Ines')
      // Mes documents : Ouvrir la lettre
      await page.getByRole('banner').getByRole('link', { name: v2.fr.docs }).click()
      await page.locator('li[data-doc]').filter({ hasText: v2.fr.kindLetter }).getByRole('button', { name: new RegExp(`^${v2.fr.open} : `) }).click()
      await expect(page).toHaveURL(/#\/lettre$/)
    })

    for (const kind of ['cv', 'lettre'] as const) {
      test(`[I05] ${kind} : si le stockage est plein, un bandeau d'alerte propose d'exporter (${vp.name})`, async ({ page }) => {
        // BUG: l’éditeur de lettre n’affiche pas le bandeau SaveBanner quand le stockage est plein
        await page.addInitScript(() => {
          const set = Storage.prototype.setItem
          Storage.prototype.setItem = function (k: string, v: string) {
            if ((window as any).__full && k === 'cvlove:v2') throw new DOMException('plein', 'QuotaExceededError')
            return set.call(this, k, v)
          }
        })
        if (kind === 'cv') {
          await edit(page)
        } else {
          await page.goto('/#/documents')
          await page.getByRole('button', { name: letterUi.fr.newLetter }).click()
          await page.getByRole('form').getByRole('button', { name: letterUi.fr.create }).click()
          await page.getByRole('button', { name: 'Complet' }).click()
        }
        await page.evaluate(() => { (window as any).__full = true })
        await page.getByLabel(kind === 'cv' ? 'Prénom' : letterUi.fr.name).fill('Zoé')
        const banner = page.getByRole('alert').filter({ hasText: extra.fr.saveQuota })
        await expect(banner).toBeVisible({ timeout: 6000 })
        const [d] = await Promise.all([page.waitForEvent('download'), banner.getByRole('button', { name: extra.fr.exportMine }).click()])
        expect(d.suggestedFilename()).toBe('cvlove-documents.json')
      })
    }

    // =============== J. THÈME ===============

    test(`[J01] thème : pas de bouton, le thème suit prefers-color-scheme (${vp.name})`, async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('button', { name: /thème|theme|sombre|dark/i })).toHaveCount(0)
      const bg = () => page.evaluate(() => getComputedStyle(document.querySelector('header')!).backgroundColor)
      await page.emulateMedia({ colorScheme: 'light' })
      const light = await bg()
      await page.emulateMedia({ colorScheme: 'dark' })
      await expect.poll(bg).not.toBe(light)
    })
  })
}

// =============== K. PARCOURS EN ANGLAIS (bureau) ===============

test.describe('anglais, bureau', () => {
  test.use({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })
  const e = T('en')

  test('[K01] parcours anglais : accueil → éditeur → saisie → PDF → documents → lettre', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your CV as a PDF')
    await page.getByRole('link', { name: e.h.create }).first().click()
    await expect(page).toHaveURL(/#\/editeur$/)
    await expect(page).toHaveTitle(/CV editor/)
    await page.getByRole('button', { name: e.g.full, exact: true }).click()
    await page.getByLabel('First name').fill('Zoe')
    // section ajoutée, modèle choisi
    await page.getByRole('button', { name: `+ ${e.u.addSection}` }).click()
    await page.getByRole('button', { name: `+ ${e.u.kinds.custom}` }).click()
    await expect.poll(async () => (await active(page))?.data.sections.some((x: any) => x.kind === 'custom')).toBe(true)
    await expect(page.getByRole('heading', { level: 3, name: cvLabels.en.sections.custom })).toBeVisible()
    await page.getByRole('button', { name: 'Classic 2' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Template Classic 2 applied' })).toBeAttached()
    // téléchargement
    const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('banner').getByRole('button', { name: e.u.download }).click()])
    expect(d.suggestedFilename()).toBe('CV-Zoe.pdf')
    expect((await pdfOf((await d.path())!)).text).toContain('Zoe')
    await expect(page.getByRole('status').filter({ hasText: 'PDF downloaded: CV-Zoe.pdf' })).toBeAttached()
    // vider un CV vide : alerte en anglais
    await page.getByLabel('First name').fill('')
    await page.getByRole('banner').getByRole('button', { name: e.u.download }).click()
    await expect(page.getByRole('alert').filter({ hasText: e.x.emptyDownload })).toBeVisible()
    await page.getByLabel('First name').fill('Zoe')
    // menu Fichier
    await page.locator('summary', { hasText: e.v.file }).click()
    const [j] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: e.u.exportJson }).click()])
    expect(JSON.parse(readFileSync((await j.path())!, 'utf8')).documents[0].data.personal.firstName).toBe('Zoe')
    // lettre assortie puis documents
    await page.getByRole('button', { name: 'Guided' }).click()
    for (let i = 0; i < 8; i++) await page.getByRole('button', { name: e.g.next }).click()
    await page.locator('main').getByRole('button', { name: e.l.matching }).click()
    await expect(page).toHaveURL(/#\/lettre$/)
    await expect(page).toHaveTitle(/Cover letter/)
    await page.getByRole('banner').getByRole('link', { name: e.v.docs }).click()
    await expect(page.locator('li[data-doc]')).toHaveCount(2)
    await page.getByRole('button', { name: 'Duplicate : Zoe' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Zoe 2 duplicated' })).toBeVisible()
    page.once('dialog', (x) => { expect(x.message()).toContain('“Zoe 2”'); void x.accept() })
    await page.getByRole('button', { name: 'Delete : Zoe 2' }).click()
    await expect(page.locator('li[data-doc]')).toHaveCount(2)
  })
})

// =============== L. PARCOURS EN ARABE, RTL (bureau) ===============

test.describe('arabe RTL, bureau', () => {
  test.use({ viewport: { width: 1440, height: 900 }, locale: 'ar' })
  const a = T('ar')

  test('[L01] parcours arabe : RTL, accueil → éditeur → étapes → modèle (flèches inversées) → PDF → documents', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await page.getByRole('link', { name: a.h.create }).first().click()
    await expect(page).toHaveURL(/#\/editeur$/)
    const title = page.locator('#step-title')
    await expect(title).toHaveText(a.g.steps[0])
    // modèles : en RTL la flèche droite va au modèle précédent
    const gallery = page.getByRole('group', { name: a.v.models, exact: true })
    const btns = gallery.locator('ul button')
    await btns.nth(1).focus()
    await page.keyboard.press('ArrowRight')
    expect(await btns.evaluateAll((bs) => bs.findIndex((b) => b === document.activeElement))).toBe(0)
    await page.keyboard.press('ArrowLeft')
    expect(await btns.evaluateAll((bs) => bs.findIndex((b) => b === document.activeElement))).toBe(1)
    await btns.nth(1).click()
    await expect(btns.nth(1)).toHaveAttribute('aria-pressed', 'true')
    // étapes
    await page.getByRole('button', { name: a.g.next }).click()
    await expect(title).toHaveText(a.g.steps[1])
    await expect(title).toBeFocused()
    await page.getByLabel(a.u.firstName).fill('Zoe')
    await page.getByRole('button', { name: a.g.skip }).click()
    await expect(title).toHaveText(a.g.steps[2])
    await page.getByRole('button', { name: a.g.prev }).click()
    await expect(title).toHaveText(a.g.steps[1])
    // complet + téléchargement
    await page.getByRole('button', { name: a.g.full, exact: true }).click()
    await expect(page.getByLabel(a.u.firstName)).toHaveValue('Zoe')
    const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('banner').getByRole('button', { name: a.u.download }).click()])
    expect(d.suggestedFilename()).toBe('CV-Zoe.pdf')
    await expect(page.getByRole('status').filter({ hasText: a.x.downloaded.replace('{file}', 'CV-Zoe.pdf') })).toBeAttached()
    // menu Fichier : exporter
    await page.locator('summary', { hasText: a.v.file }).click()
    const [j] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: a.u.exportJson }).click()])
    expect(JSON.parse(readFileSync((await j.path())!, 'utf8')).documents[0].data.personal.firstName).toBe('Zoe')
    // documents : renommer
    await page.getByRole('banner').getByRole('link', { name: a.v.docs }).click()
    await expect(page.locator('li[data-doc]')).toHaveCount(1)
    await page.getByRole('button', { name: new RegExp(`^${a.v.rename} : `) }).click()
    await page.getByLabel(a.v.renameLabel).fill('Zoe-ar')
    await page.getByLabel(a.v.renameLabel).press('Enter')
    await expect(page.locator('li[data-doc="Zoe-ar"]')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    // la mise en page n'a pas de défilement horizontal
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
})
