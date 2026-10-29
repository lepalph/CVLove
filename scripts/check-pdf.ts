// pnpm check:pdf : rend chaque modèle x 7 langues + cas limites (texte long, photo, Letter, niveaux en barres et points,
// réglages extrêmes, chaque paire de polices), vérifie avec pdf.js que le texte est extractible et propre (pas de caractère
// de contrôle : glyphe parasite), que les libellés de la langue sont présents, et exporte la page 1 en PNG dans out/.
// Les 3 lettres de motivation x 7 langues, Letter et texte long sur 2 pages sont aussi rendus (PNG lettre-*.png).
// Les rendus sont répartis entre N processus (--shard i/N) : react-pdf est du JS synchrone, les threads ne l'accéléreraient pas.
import { createCanvas } from '@napi-rs/canvas'
import { spawn } from 'node:child_process'
import { cpus } from 'node:os'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { cvLabels } from '../src/i18n/labels'
import { DEFAULT_DESIGN, visibleSections } from '../src/model/cv'
import { letterLabels } from '../src/i18n/letter'
import { formatDay, formatMonth } from '../src/model/dates'
import { letterFromCV } from '../src/model/letter'
import { sampleCV } from '../src/model/sample'
import { FONT_PAIRS, LANGS, type CV, type Design, type Lang, type Letter } from '../src/model/types'
import { startLoader } from './vite-load'

const SHARDS = Math.min(6, cpus().length)
const shardArg = process.argv.indexOf('--shard')

if (shardArg < 0) {
  // Parent : lance les enfants, agrège
  const t0 = Date.now()
  const self = fileURLToPath(import.meta.url)
  let ok = 0
  let ko = 0
  let crashed = 0
  const lines: string[] = []
  await Promise.all(
    Array.from({ length: SHARDS }, (_, i) => new Promise<void>((done) => {
      const p = spawn(process.execPath, ['--import', 'tsx', self, '--shard', `${i}/${SHARDS}`], { stdio: ['ignore', 'pipe', 'inherit'] })
      let buf = ''
      p.stdout.on('data', (d) => (buf += d))
      p.on('close', (code) => {
        for (const l of buf.split('\n').filter(Boolean)) {
          lines.push(l)
          if (l.startsWith('OK ')) ok++
          else if (l.startsWith('KO ')) ko++
        }
        if (code !== 0 && !/^KO /m.test(buf)) crashed++
        done()
      })
    })),
  )
  lines.sort().forEach((l) => console.log(l))
  console.log(`${ok}/${ok + ko} rendus valides${crashed ? `, ${crashed} processus en erreur` : ''} (${((Date.now() - t0) / 1000).toFixed(0)} s, ${SHARDS} processus)`)
  if (!ok) console.log('KO  aucun rendu valide : registre vide, filtre ONLY sans résultat ou crash au chargement')
  process.exit(ko || crashed || !ok ? 1 : 0)
}

// ---- Enfant ----
const [shard, shards] = process.argv[shardArg + 1].split('/').map(Number)
const fonts = fileURLToPath(new URL('../public/fonts/', import.meta.url))
const out = fileURLToPath(new URL('../out/', import.meta.url))
mkdirSync(out, { recursive: true })
const loader = await startLoader()
const { templates } = await loader.load('/src/templates/index.ts')
const { renderPdf, renderLetterPdf } = await loader.load('/src/pdf/render.tsx')
const { letterLayouts } = await loader.load('/src/templates/letterTemplates.ts')

// Extraction arabe : react-pdf inverse les ligatures lam-alef (« الآن » -> « اآلن ») et réordonne les groupes de
// mots mixtes ; on compare donc mot à mot, sans espaces, ni ل/ا, ni voyelles brèves (rendu visuel : voir les PNG).
const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/[ً-ٟـ\sلا]/g, '')
// Caractères de contrôle, zone privée, remplacement : signes d'un glyphe parasite (vu avec Inter SemiBold sur « mar. »)
const JUNK = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f�-]/

const designOf = (t: { id: string; preset: object }, over: Partial<Design> = {}): Design => ({ ...DEFAULT_DESIGN, ...t.preset, templateId: t.id, ...over })

/** Photo grise 64 px en data URL. */
const photo = () => {
  const c = createCanvas(64, 64)
  const g = c.getContext('2d')
  g.fillStyle = '#888'
  g.fillRect(0, 0, 64, 64)
  return `data:image/png;base64,${c.toBuffer('image/png').toString('base64')}`
}

/** CV d'exemple + 12 expériences (une par mois : toutes les abréviations de mois passent par la police). */
function longCV(lang: Lang): CV {
  const cv = sampleCV(lang, 'dev')
  const exp = cv.sections.find((s) => s.kind === 'experience')!
  exp.items = Array.from({ length: 12 }, (_, i) => ({ ...exp.items[i % 2], id: `x${i}`, text: exp.items[i % 2].text.repeat(3), start: `20${10 + i}-${String(i + 1).padStart(2, '0')}`, end: i ? `20${11 + i}-${String(12 - i).padStart(2, '0')}` : '', current: i === 0 }))
  cv.personal.photo = photo()
  return cv
}

async function savePng(doc: any, file: string, scale: number, pageNo = 1) {
  const page = await doc.getPage(pageNo)
  const vp = page.getViewport({ scale })
  const canvas = createCanvas(vp.width, vp.height)
  await page.render({ canvasContext: canvas.getContext('2d') as any, viewport: vp, canvas: canvas as any }).promise
  writeFileSync(`${out}${file}.png`, canvas.toBuffer('image/png'))
}

interface Job { name: string; run: () => Promise<{ problems: string[]; info: string }> }

/** Extrait le texte d'un PDF et contrôle : mots attendus présents, aucun caractère parasite, nombre de pages, format de page, PNG. */
async function verify(bytes: Uint8Array, expected: string[], lang: Lang, o: { minPages?: number; png?: string; pngPages?: number; size?: [number, number] }) {
  const doc = await getDocument({ data: bytes.slice(), useSystemFonts: false, verbosity: 0 }).promise
  let text = ''
  for (let p = 1; p <= doc.numPages; p++) {
    const c = await (await doc.getPage(p)).getTextContent()
    text += c.items.map((i: any) => ('str' in i ? i.str : '')).join(' ') + ' '
  }
  const hayN = norm(text)
  const problems: string[] = []
  const missing = expected.flatMap((e) => e.split(/\s+/)).filter((w) => norm(w) && !hayN.includes(norm(w)))
  if (missing.length) problems.push('manquants : ' + missing.join(' | '))
  if (lang !== 'ar' && JUNK.test(text)) problems.push(`caractère parasite dans le texte extrait (U+${JUNK.exec(text)![0].codePointAt(0)!.toString(16)})`)
  if (doc.numPages < (o.minPages ?? 1)) problems.push(`${doc.numPages} page(s) au lieu de ${o.minPages}`)
  if (o.size) {
    const [w, h] = (await doc.getPage(1)).view.slice(2)
    if (Math.abs(w - o.size[0]) > 1 || Math.abs(h - o.size[1]) > 1) problems.push(`format ${w}x${h}`)
  }
  if (o.png) for (let p = 1; p <= Math.min(doc.numPages, o.pngPages ?? 1); p++) await savePng(doc, o.pngPages ? `${o.png}-p${p}` : o.png, 1.5, p)
  return { problems, info: `${doc.numPages} p, ${bytes.length} o` }
}

type Opts = { minPages?: number; png?: string; pngPages?: number; size?: [number, number] }

/** Rend un CV puis le contrôle : titres de sections, « Présent », un mois, le prénom. */
async function check(cv: CV, design: Design, o: Opts = {}) {
  const labels = cvLabels[cv.lang]
  const expected = [...visibleSections(cv).map((s) => labels.sections[s.kind]), labels.present, formatMonth('2021-03', cv.lang), cv.personal.firstName]
  return verify(await renderPdf(cv, design, fonts), expected, cv.lang, o)
}

const BODIES: Partial<Record<Lang, string[]>> = {
  fr: ["Je vous écris pour vous proposer ma candidature au poste de développeuse web. Depuis six ans, je conçois des produits grand public, de l'idée à la mise en production.", "Chez Atelier Lumen, j'ai refondu le tunnel de commande (+18 % de conversion) et encadré deux juniors. Votre équipe me semble le bon endroit pour continuer à livrer souvent et bien.", 'Je serais ravie de vous rencontrer pour en parler.'],
  ar: ['أكتب إليكم لتقديم طلب ترشحي لوظيفة مطورة ويب. أعمل منذ ست سنوات على منتجات موجهة للجمهور، من الفكرة إلى الإطلاق.', 'في أتيليه لومين أعدت تصميم مسار الطلب فارتفع التحويل بنسبة 18٪ وأشرفت على مطورين مبتدئين.', 'يسعدني لقاؤكم للحديث عن ذلك.'],
}
const EN_BODY = ['I am writing to apply for the web developer position. For six years I have built consumer products, from the first idea to production.', 'At Atelier Lumen I rebuilt the checkout funnel (+18 % conversion) and mentored two juniors. Your team looks like the right place to keep shipping often and well.', 'I would be glad to meet and talk it through.']

/** Lettre d'exemple : expéditeur repris du CV d'exemple, corps de la langue (anglais pour les langues sans texte propre), `times` x le corps. */
function sampleLetter(lang: Lang, times = 1): Letter {
  const l = letterFromCV(sampleCV(lang, 'dev'))
  const body = BODIES[lang] ?? EN_BODY
  return {
    ...l, place: lang === 'ar' ? 'ليون' : 'Lyon', date: '2026-03-12',
    recipient: { name: lang === 'ar' ? 'السيدة سلمى' : 'Mme Sophie Bernard', company: 'Studio Pivoine', address: '12 rue des Fleurs\n69003 Lyon' },
    subject: lang === 'fr' ? 'Candidature au poste de développeuse web' : lang === 'ar' ? 'طلب ترشح لوظيفة مطورة ويب' : 'Application for the web developer position',
    body: Array.from({ length: times }, () => body.join('\n\n')).join('\n\n'),
  }
}

/** Rend une lettre puis la contrôle : « Objet », nom, entreprise, date, début du corps et de la formule de politesse. */
async function checkLetter(letter: Letter, design: Design, o: Opts = {}) {
  const lab = letterLabels[letter.lang]
  const expected = [lab.subject, letter.sender.name, letter.recipient.company, formatDay(letter.date, letter.lang), lab.salutation.replace(/[،,:]/g, ''), lab.closing.split(/\s+/).slice(0, 3).join(' '), letter.body.split(/\s+/).slice(0, 4).join(' ')]
  return verify(await renderLetterPdf(letter, design, fonts), expected, letter.lang, o)
}

const jobs: Job[] = []
// Registre : au moins un modèle, ids uniques, `meta.id` = nom du fichier, 3 styles par mise en page (un id qui diffère du fichier casse la sélection)
jobs.push({
  name: 'registre',
  run: async () => {
    const problems: string[] = []
    const dup = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i)
    if (!templates.length || !letterLayouts.length) problems.push('registre vide')
    for (const [id, what] of [[dup(templates.map((t: any) => t.id)), 'modèles'], [dup(letterLayouts.map((l: any) => l.id)), 'lettres']] as const)
      if (id.length) problems.push(`ids en double (${what}) : ${id.join(', ')}`)
    for (const dir of ['layouts', 'letters'])
      for (const f of readdirSync(new URL(`../src/templates/${dir}/`, import.meta.url)).filter((f) => f.endsWith('.tsx'))) {
        const { meta } = await loader.load(`/src/templates/${dir}/${f}?meta`)
        if (meta.id !== f.replace(/\.tsx$/, '')) problems.push(`${dir}/${f} : meta.id « ${meta.id} » ≠ nom du fichier`)
        if (dir === 'layouts' && meta.styles?.length !== 3) problems.push(`${f} : ${meta.styles?.length} styles au lieu de 3`)
      }
    return { problems, info: `${templates.length} modèles, ${letterLayouts.length} lettres` }
  },
})
for (const t of templates) {
  for (const lang of LANGS)
    jobs.push({ name: `${t.id}/${lang}`, run: () => check(sampleCV(lang, 'dev'), designOf(t), { png: lang === 'fr' || lang === 'ar' ? `${t.id}-${lang}` : undefined }) })
  for (const lang of ['en', 'ar'] as const)
    jobs.push({ name: `${t.id}/${lang} long + photo`, run: () => check(longCV(lang), designOf(t), { minPages: 2, png: `long-${t.id}-${lang}`, pngPages: 2 }) })
  // Letter + niveaux en barres ; points + réglages extrêmes (grande police, grandes marges, interligne serré / aéré)
  jobs.push({ name: `${t.id}/fr Letter + barres`, run: () => check(sampleCV('fr', 'dev'), designOf(t, { pageSize: 'LETTER', skillDisplay: 'bars' }), { size: [612, 792], png: `letter-${t.id}-fr` }) })
  jobs.push({ name: `${t.id}/en points, 115 %, marges larges`, run: () => check(longCV('en'), designOf(t, { skillDisplay: 'dots', fontScale: 1.15, margins: 'large', lineHeight: 1.6, photoShape: 'square' }), { minPages: 2, png: `max-${t.id}-en` }) })
  jobs.push({ name: `${t.id}/de 90 %, marges serrées, niveaux en texte`, run: () => check(sampleCV('de', 'dev'), designOf(t, { skillDisplay: 'text', fontScale: 0.9, margins: 'compact', lineHeight: 1.2, accent: '#facc15' })) })
}
// Lettres de motivation : 3 mises en page x 7 langues, Letter, texte long sur 2 pages (accent clair, grande police, marges larges)
for (const l of letterLayouts) {
  const d = (over: Partial<Design> = {}): Design => ({ ...DEFAULT_DESIGN, templateId: l.id, ...over })
  for (const lang of LANGS)
    jobs.push({ name: `${l.id}/${lang}`, run: () => checkLetter(sampleLetter(lang), d(), { png: lang === 'fr' || lang === 'ar' ? `${l.id}-${lang}` : undefined }) })
  jobs.push({ name: `${l.id}/fr Letter`, run: () => checkLetter(sampleLetter('fr'), d({ pageSize: 'LETTER' }), { size: [612, 792], png: `${l.id}-letter` }) })
  for (const lang of ['fr', 'ar'] as const)
    jobs.push({ name: `${l.id}/${lang} long (2 pages)`, run: () => checkLetter(sampleLetter(lang, 9), d({ accent: '#facc15', fontScale: 1.1, margins: 'large' }), { minPages: 2, png: `${l.id}-long-${lang}`, pngPages: 2 }) })
}
// Chaque paire de polices x langues latines, avec les 12 mois : le glyphe parasite se voit ici
for (const fontPair of FONT_PAIRS)
  for (const lang of ['fr', 'es', 'pt', 'de', 'it', 'en'] as const)
    jobs.push({ name: `police ${fontPair}/${lang}`, run: () => check(longCV(lang), { ...DEFAULT_DESIGN, templateId: 'classique-1', fontPair, skillDisplay: 'bars' }, { minPages: 2, png: lang === 'fr' ? `font-${fontPair}` : undefined }) })

let ko = 0
for (const [i, job] of jobs.entries()) {
  if (i % shards !== shard) continue
  if (process.env.ONLY && !new RegExp(process.env.ONLY).test(job.name)) continue // ONLY=<regex> : seulement ces rendus
  try {
    const r = await job.run()
    if (r.problems.length) ko++
    console.log(`${r.problems.length ? 'KO ' : 'OK '} ${job.name}  ${r.info}${r.problems.length ? '  ' + r.problems.join(' ; ') : ''}`)
  } catch (e) {
    ko++
    console.log(`KO  ${job.name}  exception : ${(e as Error).message}`)
  }
}
await loader.close()
process.exit(ko ? 1 : 0)
