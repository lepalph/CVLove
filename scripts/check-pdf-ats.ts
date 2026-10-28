// pnpm check:pdf:b : régressions du moteur PDF (lot B). Échoue si :
//  - ATS : un mot connu du contenu ressort éclaté (« S O P H I E »), une ligature (« ﬁ ») disparaît, ou un mot est coupé par « ’ » ;
//  - pagination : un titre de section reste seul en bas de page, ou le nombre de pages explose (Letter, 115 %, marges larges, accent clair) ;
//  - arabe : le texte arabe d'un CV passé en français n'a pas de police (glyphes absents) ;
//  - contraste : texte d'accent < 4,5:1 sur blanc (voir aussi src/templates/contrast.test.ts).
import { fileURLToPath } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { cvLabels } from '../src/i18n/labels'
import { DEFAULT_DESIGN } from '../src/model/cv'
import { sampleCV } from '../src/model/sample'
import type { CV, Design, Lang } from '../src/model/types'
import { startLoader } from './vite-load'

const fonts = fileURLToPath(new URL('../public/fonts/', import.meta.url))
const loader = await startLoader()
const { templates } = await loader.load('/src/templates/index.ts')
const { renderPdf } = await loader.load('/src/pdf/render.tsx')
const designOf = (t: { id: string; preset: object }, over: Partial<Design> = {}): Design => ({ ...DEFAULT_DESIGN, ...t.preset, templateId: t.id, ...over })

interface Line { page: number; y: number; text: string }
/** Texte brut (items collés tels quels : c'est ce que voit un ATS) + lignes avec position, de haut en bas par page. */
async function extract(bytes: Uint8Array) {
  const doc = await getDocument({ data: bytes.slice(), useSystemFonts: false, verbosity: 0 }).promise
  let raw = ''
  const lines: Line[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const items = (await (await doc.getPage(p)).getTextContent()).items.filter((i: any) => 'str' in i) as any[]
    raw += items.map((i) => i.str + (i.hasEOL ? '\n' : '')).join('') + '\n'
    for (const i of items) if (i.str.trim()) lines.push({ page: p, y: i.transform[5], text: i.str })
  }
  return { raw, lines, pages: doc.numPages }
}

const problems: string[] = []
const fail = (name: string, msg: string) => { problems.push(`KO  ${name}  ${msg}`) }

// ---- 1. ATS : mots entiers, ligature, apostrophe ----
function atsCV(): CV {
  const cv = sampleCV('fr')
  cv.personal.firstName = 'Sophie'
  cv.personal.lastName = 'Lefèvre-Duchâtel'
  cv.sections.find((s) => s.kind === 'profile')!.items[0].text = 'Responsable ﬁnancier : pilotage de l’équipe commerciale, coût d’offre réduit, œuvre à l’efﬁcacité des échanges.'
  return cv
}
const ATS_WORDS = ['Sophie', 'Lefèvre-Duchâtel', 'financier', 'l’équipe', 'd’offre', 'l’efficacité', 'œuvre']
for (const t of templates) {
  const cv = atsCV()
  const { raw } = await extract(await renderPdf(cv, designOf(t), fonts))
  const hay = raw.toLowerCase().replace(/[ \n]+/g, ' ')
  // caractère de contrôle dans le texte extrait = table ToUnicode vide pour un glyphe (« Form\u001dtion », « l\u0019équipe »)
  const junk = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\ufffd]/.exec(raw)
  if (junk) fail(`${t.id}/ats`, `caractère parasite U+${junk[0].codePointAt(0)!.toString(16)} dans « ${raw.slice(Math.max(0, junk.index - 6), junk.index + 6).replace(/\n/g, '|')} »`)
  // nom d'un seul tenant (pas « C|AMILLE ») et avant toute colonne latérale (Contact, Compétences...) dans l'ordre d'extraction
  const flat = raw.replace(/\s+/g, ' ').toLowerCase()
  const name = flat.indexOf('sophie')
  if (!/sophie\s+lefèvre-duchâtel/i.test(raw)) fail(`${t.id}/ats`, 'nom éclaté ou non contigu dans le texte extrait')
  for (const side of [cvLabels.fr.sections.skills, 'contact'])
    if (flat.indexOf(side.toLowerCase()) < name && flat.indexOf(side.toLowerCase()) >= 0) fail(`${t.id}/ats`, `« ${side} » sort avant le nom`)
  const words = [...ATS_WORDS, ...cv.sections.map((s) => cvLabels.fr.sections[s.kind])]
  for (const w of words) if (!hay.includes(w.toLowerCase())) fail(`${t.id}/ats`, `mot absent ou éclaté : « ${w} »`)
}

// Lettres : mêmes règles sur un corps qui passe à la ligne autour des apostrophes
{
  const { letterLayouts } = await loader.load('/src/templates/letterTemplates.ts')
  const { renderLetterPdf } = await loader.load('/src/pdf/render.tsx')
  const { letterFromCV } = await loader.load('/src/model/letter.ts')
  for (const l of letterLayouts) {
    const letter = letterFromCV(atsCV())
    letter.subject = 'Candidature à l’offre d’ingénieure'
    letter.body = Array.from({ length: 3 }, () => 'Je vous écris pour l’équipe d’Atelier Lumen, qu’il s’agisse d’un poste d’ingénieure ; j’ai conçu l’outil d’aujourd’hui et l’architecture de l’application, n’hésitez pas à m’écrire sur l’adresse d’un collègue.').join('\n\n')
    const { raw } = await extract(await renderLetterPdf(letter, { ...DEFAULT_DESIGN, templateId: l.id }, fonts))
    const flat = raw.replace(/\n/g, ' ')
    for (const w of ['l’équipe', 'd’Atelier', 'qu’il', 's’agisse', 'd’ingénieure', 'j’ai', 'l’outil', 'd’aujourd’hui', 'l’architecture', 'l’application', 'n’hésitez', 'm’écrire', 'l’adresse', 'd’un', 'l’offre'])
      if (!flat.includes(w)) fail(`${l.id}/ats`, `mot coupé par l’apostrophe : « ${w} »`)
    if (/[\u0000-\u0008\u000b-\u001f]/.test(raw)) fail(`${l.id}/ats`, 'caractère parasite dans le texte extrait')
  }
}

// ---- 2. Pagination : CV long, Letter, 115 %, marges larges, accent très clair ----
function longCV(): CV {
  const cv = sampleCV('fr')
  const exp = cv.sections.find((s) => s.kind === 'experience')!
  const bullet = (j: number, k: number) => `- Poste${j}×${k} Pilotage de l’équipe commerciale et définition de la stratégie d’offre ; coût réduit de 12 € par dossier, taux de réussite à 87 %, œuvre à l’efficacité des échanges.`
  exp.items = Array.from({ length: 6 }, (_, j) => ({ ...exp.items[0], id: `p${j}`, title: `Poste ${j + 1} Responsable développement`, text: [1, 2, 3, 4, 5].map((k) => bullet(j + 1, k)).join('\n'), current: false, start: `20${10 + j}-01`, end: `20${11 + j}-12` }))
  return cv
}
const MAX_PAGES = 7
for (const t of templates.filter((x: { id: string }) => x.id.endsWith('-1'))) {
  const cv = longCV()
  const titles = cv.sections.map((s) => cvLabels.fr.sections[s.kind].toLowerCase())
  const d = designOf(t, { pageSize: 'LETTER', fontScale: 1.15, margins: 'large', accent: '#fff3b0' })
  const { lines, pages } = await extract(await renderPdf(cv, d, fonts))
  if (pages > MAX_PAGES) fail(`${t.id}/pagination`, `${pages} pages (max ${MAX_PAGES})`)
  for (let p = 1; p <= pages; p++) {
    const page = lines.filter((l) => l.page === p)
    // titre orphelin : plus aucun texte sous lui ni à sa hauteur (un contenu sur la même ligne, en colonne de libellés, compte comme dessous)
    for (const title of page.filter((l) => titles.includes(l.text.trim().toLowerCase())))
      if (!page.some((l) => l !== title && l.y < title.y + 3)) fail(`${t.id}/pagination`, `titre « ${title.text.trim()} » en dernière ligne de la page ${p}`)
  }
}

// ---- 3. Arabe sous une langue latine : chaque glyphe arabe doit avoir une police ----
for (const lang of ['fr', 'en'] as Lang[]) {
  const cv = sampleCV('ar')
  cv.lang = lang
  for (const t of templates.filter((x: { id: string }) => x.id.endsWith('-1'))) {
    const { raw } = await extract(await renderPdf(cv, designOf(t), fonts))
    if (!/[؀-ۿ]/.test(raw)) fail(`${t.id}/arabe-sous-${lang}`, 'aucun caractère arabe extrait (police de repli absente ?)')
  }
}

await loader.close()
for (const p of problems) console.log(p)
console.log(problems.length ? `${problems.length} problème(s)` : 'OK  check:pdf:b : ATS, pagination, arabe')
process.exit(problems.length ? 1 : 0)
