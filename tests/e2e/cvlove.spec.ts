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
  const colors = new Set<string>()
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    text += (await page.getTextContent()).items.map((i) => ('str' in i ? i.str : '')).join(' ') + ' '
    const ops = await page.getOperatorList()
    images += ops.fnArray.filter((f) => f === OPS.paintImageXObject || f === OPS.paintInlineImageXObject).length
    ops.fnArray.forEach((f, i) => {
      if (f === OPS.setFillRGBColor || f === OPS.setStrokeRGBColor) colors.add(String(ops.argsArray[i]).toLowerCase())
    })
  }
  return { text, images, colors: [...colors] }
}

/** Un nouveau CV est vide ; `sample` clique sur « Informatique » (exemple Camille Marchand) pour les tests qui lisent un document rempli. */
const openEditor = async (page: Page, sample = false) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await expect(page).toHaveURL(/#\/editeur/)
  await page.getByRole('button', { name: 'Complet' }).click() // un nouveau document démarre en mode guidé ; ces tests utilisent le formulaire complet
  await expect(page.getByRole('button', { name: 'Classique · Académique', pressed: true })).toBeVisible()
  if (sample) {
    await page.getByRole('button', { name: 'Informatique' }).click()
    await expect(page.getByLabel('Prénom')).toHaveValue('Camille')
  }
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

test('accueil : « Commencer avec ce modèle » (Moderne · Bandeau), puis changement de modèle sans perte du prénom', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Votre CV en PDF, sans compte et sans frais.')
  await page.getByRole('button', { name: 'Commencer avec ce modèle (Moderne · Bandeau)' }).click()
  await expect(page).toHaveURL(/#\/editeur/)
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByRole('button', { name: 'Moderne · Bandeau', pressed: true })).toBeVisible()
  await page.getByLabel('Prénom').fill('Zoé')
  await page.getByRole('button', { name: 'Minimal · Gouttière' }).click()
  await expect(page.getByRole('button', { name: 'Minimal · Gouttière', pressed: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Moderne · Bandeau', pressed: false })).toBeVisible()
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
  await openEditor(page, true)
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

// ---- v2 ----

/** Un état v1 réel (zustand persist, clé `cvlove:v1`), posé avant le premier chargement s'il n'y a pas encore de v2. */
const v1State = {
  state: {
    uiLang: 'fr',
    cv: {
      lang: 'fr', templateId: 'moderne', accent: '#1d4ed8',
      personal: {
        firstName: 'Zoé', lastName: 'Durand', title: 'Designer', photo: '',
        fields: [{ id: 'f1', kind: 'email', value: 'zoe@exemple.fr', visible: true }],
      },
      sections: [
        { id: 's1', kind: 'experience', title: 'Mon parcours', visible: true, items: [{ id: 'i1', title: 'Cheffe de projet', subtitle: 'Boîte', place: 'Lyon', start: '2020-01', end: '', current: true, text: '- un' }] },
      ],
    },
  },
  version: 1,
}

test('migration v1 → v2 : le CV existant devient le premier document', async ({ page }) => {
  await page.addInitScript((v1) => {
    if (!localStorage.getItem('cvlove:v2')) localStorage.setItem('cvlove:v1', JSON.stringify(v1))
  }, v1State)
  await page.goto('/#/editeur')
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  await expect(page.getByRole('button', { name: 'Complet', pressed: true })).toBeVisible() // document migré : mode complet
  await expect(page.getByRole('button', { name: 'Moderne · Bandeau', pressed: true })).toBeVisible()
  await expect(page.locator('h3').filter({ hasText: 'Mon parcours' })).toBeVisible()
  await expect(page.locator('input[type=color]')).toHaveValue('#1d4ed8')
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await expect(page).toHaveURL(/#\/documents/)
  await expect(page.getByRole('listitem').filter({ hasText: 'CV' })).toHaveCount(1)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cvlove:v2')!).version)).toBe(2)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cvlove:v1'))).toBeNull() // migré : le doublon est supprimé
})

test('Mes documents : dupliquer, modifier la copie, renommer, supprimer', async ({ page }) => {
  await openEditor(page)
  await page.getByLabel('Prénom').fill('Zoé')
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await page.getByRole('button', { name: 'Dupliquer : Zoé' }).click()
  const items = page.locator('li[data-doc]')
  await expect(items).toHaveCount(2)
  await expect(page.locator('li[data-doc="Zoé 2"]')).toBeVisible()
  // la copie est active : on l'ouvre, on change son prénom ; l'original ne bouge pas
  await page.getByRole('button', { name: 'Ouvrir : Zoé 2' }).click()
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  await page.getByLabel('Prénom').fill('Copie')
  await page.getByLabel('Nom', { exact: true }).fill('Durand')
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await page.getByRole('button', { name: 'Ouvrir : Zoé', exact: true }).click()
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  // renommer puis supprimer (avec confirmation)
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await page.getByRole('button', { name: 'Renommer : Zoé 2' }).click()
  await page.getByLabel('Nom du document').fill('Candidature Lyon')
  await page.getByLabel('Nom du document').press('Enter')
  await expect(page.locator('li[data-doc="Candidature Lyon"]')).toBeVisible()
  page.once('dialog', (d) => { expect(d.message()).toContain('Candidature Lyon'); void d.accept() })
  await page.getByRole('button', { name: 'Supprimer : Candidature Lyon' }).click()
  await expect(items).toHaveCount(1)
})

test('design : police et couleur changées se voient dans le PDF téléchargé, texte toujours extractible', async ({ page }) => {
  await openEditor(page, true)
  await page.getByLabel('Police').selectOption('playfair')
  await page.locator('input[type=color]').fill('#0e7490')
  await page.getByRole('button', { name: 'A4' }).click()
  await page.getByRole('button', { name: 'Letter' }).click()
  const path = (await (await download(page)).path())!
  const raw = readFileSync(path).toString('latin1')
  expect(raw).toContain('CVLoveDisplay') // police des titres embarquée
  const pdf = await pdfOf(path)
  expect(pdf.text).toContain('Camille')
  expect(pdf.text).toContain('Formation')
  expect(pdf.colors).toContain('#0e7490') // couleur d'accent
  const doc = await getDocument({ data: new Uint8Array(readFileSync(path)), verbosity: 0 }).promise
  expect((await doc.getPage(1)).view.slice(2)).toEqual([612, 792]) // Letter
})

// ---- mode guidé et catalogue d'accueil ----

test('mode guidé : parcours complet, passer une étape, retour, bascule en Complet sans perte, téléchargement', async ({ page }) => {
  await page.goto('/#/editeur')
  await expect(page.getByRole('button', { name: 'Guidé', pressed: true })).toBeVisible()
  const bar = page.getByRole('navigation', { name: 'Étapes' })
  const current = (name: string) => expect(bar.getByRole('button', { name, exact: true })).toHaveAttribute('aria-current', 'step')
  await current('Modèle')
  await page.getByRole('button', { name: 'Minimal · Gouttière' }).click()
  await page.getByRole('button', { name: 'Suivant' }).click()
  await current('Identité')
  await page.getByLabel('Prénom').fill('Zoé')
  await page.getByLabel('Nom', { exact: true }).fill('Durand')
  await page.getByRole('button', { name: 'Suivant' }).click()
  await current('Profil')
  await page.getByRole('button', { name: 'Passer cette étape' }).click()
  await current('Expérience')
  await expect(bar.getByRole('button', { name: 'Identité (faite)' })).toBeVisible()
  await expect(bar.getByRole('button', { name: 'Profil', exact: true })).toBeVisible() // passée, pas « faite »
  await page.getByRole('button', { name: 'Précédent' }).click()
  await current('Profil')
  // bascule en Complet : rien n'est perdu, et on retrouve l'étape en revenant
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  await expect(page.getByRole('button', { name: 'Minimal · Gouttière', pressed: true })).toBeVisible()
  await page.getByLabel('Nom', { exact: true }).fill('Martin')
  await page.getByRole('button', { name: 'Guidé' }).click()
  await current('Profil')
  await bar.getByRole('button', { name: 'Télécharger', exact: true }).click()
  await current('Télécharger')
  const final = page.getByRole('region', { name: 'Télécharger' })
  await expect(final).toContainText('Zoé Martin')
  await expect(final.getByRole('link', { name: 'Voir mes documents' })).toHaveAttribute('href', '#/documents')
  const [d] = await Promise.all([page.waitForEvent('download'), final.getByRole('button', { name: 'Télécharger le PDF' }).click()])
  expect(d.suggestedFilename()).toBe('CV-Zoe-Martin.pdf')
  expect((await pdfOf((await d.path())!)).text).toContain('Zoé')
  // le choix est mémorisé avec le document
  await page.reload()
  await expect(page.getByRole('button', { name: 'Guidé', pressed: true })).toBeVisible()
})

test('accueil : le catalogue liste tous les modèles et se filtre', async ({ page }) => {
  await page.goto('/')
  const cards = page.getByRole('button', { name: /^Commencer avec ce modèle \(/ })
  const total = await cards.count()
  expect(total).toBeGreaterThanOrEqual(12)
  await expect(page.getByRole('heading', { level: 2, name: `Un catalogue de ${total} modèles` })).toBeVisible()
  await page.getByRole('group', { name: 'Catégorie' }).getByRole('button', { name: 'Créatif' }).click()
  await expect.poll(() => cards.count()).toBeLessThan(total)
  expect(await cards.count()).toBeGreaterThan(0)
  await page.getByRole('group', { name: 'Catégorie' }).getByRole('button', { name: 'Tous' }).click()
  await expect.poll(() => cards.count()).toBe(total)
  await page.getByRole('group', { name: 'Colonnes' }).getByRole('button', { name: '2 colonnes' }).click()
  await page.getByRole('group', { name: 'Photo' }).getByRole('button', { name: 'Sans photo' }).click()
  await expect.poll(() => cards.count()).toBeLessThan(total)
})

// ---- lettre de motivation ----

test('lettre : créée depuis un CV (expéditeur repris, indépendant), corps modifié, PDF téléchargé avec le bon texte', async ({ page }) => {
  await openEditor(page)
  await page.getByLabel('Prénom').fill('Zoé')
  await page.getByLabel('Nom', { exact: true }).fill('Durand')
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await page.getByRole('button', { name: 'Nouvelle lettre' }).click()
  await expect(page.getByLabel('CV source')).toHaveValue(/.+/) // le premier CV est proposé
  await page.getByRole('button', { name: 'Créer la lettre' }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  await expect(page.getByRole('button', { name: 'Guidé', pressed: true })).toBeVisible()
  await expect(page.getByLabel('Nom complet')).toHaveValue('Zoé Durand') // expéditeur repris du CV
  await expect(page.locator('canvas').first()).toBeAttached({ timeout: 20_000 })
  // parcours guidé : destinataire, objet, corps
  await page.getByRole('button', { name: 'Suivant' }).click()
  await page.getByLabel('Entreprise').fill('Studio Pivoine')
  await page.getByRole('button', { name: 'Suivant' }).click()
  await page.getByRole('textbox', { name: 'Objet' }).fill('Candidature développeuse')
  await page.getByRole('button', { name: 'Suivant' }).click()
  await page.getByLabel('Corps de la lettre').fill('Bonjour à toute l’équipe.\n\nVoici ma motivation.')
  // bascule en complet sans perte : tout est sur une page
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByLabel('Corps de la lettre')).toHaveValue(/Voici ma motivation/)
  await expect(page.getByLabel('Entreprise')).toHaveValue('Studio Pivoine')
  await page.getByLabel('Corps de la lettre').fill('Bonjour à toute l’équipe.\n\nVoici ma motivation modifiée.')
  const d = await download(page)
  expect(d.suggestedFilename()).toBe('Lettre-Zoe-Durand.pdf')
  const pdf = await pdfOf((await d.path())!)
  for (const s of ['Zoé Durand', 'Studio Pivoine', 'Objet', 'Candidature développeuse', 'Madame, Monsieur,', 'Voici ma motivation modifiée.']) expect(pdf.text).toContain(s)
  // le CV n'a pas bougé quand on édite la lettre
  await page.getByLabel('Nom complet').fill('Autre Nom')
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await expect(page.locator('li[data-doc]')).toHaveCount(2)
  await page.getByRole('button', { name: 'Ouvrir : Zoé Durand', exact: true }).click()
  await expect(page.getByLabel('Prénom')).toHaveValue('Zoé')
  // et la lettre se rouvre depuis la liste, avec ses modifications
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await page.getByRole('button', { name: /^Ouvrir : Lettre/ }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  await expect(page.getByLabel('Nom complet')).toHaveValue('Autre Nom')
})

test('éditeur de CV : « Créer la lettre assortie » reprend le CV, l’accent et la langue ; la langue de la lettre change les formules', async ({ page }) => {
  await openEditor(page, true)
  await page.locator('input[type=color]').fill('#0e7490')
  await page.getByRole('button', { name: 'Créer la lettre assortie' }).click()
  await expect(page).toHaveURL(/#\/lettre/)
  await page.getByRole('button', { name: 'Complet' }).click()
  await expect(page.getByLabel('Nom complet')).toHaveValue('Camille Marchand')
  await expect(page.getByLabel('Lieu')).toHaveValue('Lyon') // ville du CV
  await expect(page.locator('input[type=color]')).toHaveValue('#0e7490')
  await expect(page.getByLabel('Formule d’appel', { exact: true })).toHaveValue('Madame, Monsieur,')
  await page.getByLabel('Langue de la lettre').selectOption('en')
  await expect(page.getByLabel('Formule d’appel', { exact: true })).toHaveValue('Dear Sir or Madam,')
  const pdf = await pdfOf((await (await download(page)).path())!)
  expect(pdf.text).toContain('Dear Sir or Madam,')
  expect(pdf.colors).toContain('#0e7490')
})

test('nouveau CV vide, nommé d’après la personne, exemple à la demande', async ({ page }) => {
  await openEditor(page)
  await expect(page.getByLabel('Prénom')).toHaveValue('')
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await expect(page.locator('li[data-doc="CV sans titre"]')).toBeVisible()
  await page.getByRole('button', { name: 'Ouvrir : CV sans titre' }).click()
  await page.getByLabel('Prénom').fill('Zoé')
  await page.getByRole('link', { name: 'Mes documents' }).click()
  await expect(page.locator('li[data-doc="Zoé"]')).toBeVisible()
})

test('fichier trop gros : message clair, rien n’est importé', async ({ page }) => {
  await page.goto('/#/documents')
  await page.locator('input[type=file][accept^="application/json"]').setInputFiles({ name: 'gros.json', mimeType: 'application/json', buffer: Buffer.alloc(5_100_000, 32) })
  await expect(page.getByRole('alert')).toContainText('trop volumineux')
})
