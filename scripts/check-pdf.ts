// pnpm check:pdf : rend chaque modèle x 7 langues + cas limites (texte long, photo, Letter, niveaux en barres et points,
// réglages extrêmes, chaque paire de polices), vérifie avec pdf.js que le texte est extractible et propre (pas de caractère
// de contrôle : glyphe parasite), que les libellés de la langue sont présents, et exporte la page 1 en PNG dans out/.
// Les rendus sont répartis entre N processus (--shard i/N) : react-pdf est du JS synchrone, les threads ne l'accéléreraient pas.
import { createCanvas } from '@napi-rs/canvas'
import { spawn } from 'node:child_process'
import { cpus } from 'node:os'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { cvLabels } from '../src/i18n/labels'
import { DEFAULT_DESIGN, visibleSections } from '../src/model/cv'
import { formatMonth } from '../src/model/dates'
import { sampleCV } from '../src/model/sample'
import { FONT_PAIRS, LANGS, type CV, type Design, type Lang } from '../src/model/types'
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
  process.exit(ko || crashed ? 1 : 0)
}

// ---- Enfant ----
const [shard, shards] = process.argv[shardArg + 1].split('/').map(Number)
const fonts = fileURLToPath(new URL('../public/fonts/', import.meta.url))
const out = fileURLToPath(new URL('../out/', import.meta.url))
mkdirSync(out, { recursive: true })
const loader = await startLoader()
const { templates } = await loader.load('/src/templates/index.ts')
const { renderPdf } = await loader.load('/src/pdf/render.tsx')

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
  const cv = sampleCV(lang)
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

/** Rend, extrait le texte, contrôle : libellés présents, aucun caractère parasite, nombre de pages, format de page. */
async function check(cv: CV, design: Design, o: { minPages?: number; png?: string; pngPages?: number; size?: [number, number] } = {}) {
  const bytes: Uint8Array = await renderPdf(cv, design, fonts)
  const doc = await getDocument({ data: bytes.slice(), useSystemFonts: false, verbosity: 0 }).promise
  let text = ''
  for (let p = 1; p <= doc.numPages; p++) {
    const c = await (await doc.getPage(p)).getTextContent()
    text += c.items.map((i: any) => ('str' in i ? i.str : '')).join(' ') + ' '
  }
  const labels = cvLabels[cv.lang]
  const expected = [...visibleSections(cv).map((s) => labels.sections[s.kind]), labels.present, formatMonth('2021-03', cv.lang), cv.personal.firstName]
  const hayN = norm(text)
  const problems: string[] = []
  const missing = expected.flatMap((e) => e.split(/\s+/)).filter((w) => norm(w) && !hayN.includes(norm(w)))
  if (missing.length) problems.push('manquants : ' + missing.join(' | '))
  if (cv.lang !== 'ar' && JUNK.test(text)) problems.push(`caractère parasite dans le texte extrait (U+${JUNK.exec(text)![0].codePointAt(0)!.toString(16)})`)
  if (doc.numPages < (o.minPages ?? 1)) problems.push(`${doc.numPages} page(s) au lieu de ${o.minPages}`)
  if (o.size) {
    const [w, h] = (await doc.getPage(1)).view.slice(2)
    if (Math.abs(w - o.size[0]) > 1 || Math.abs(h - o.size[1]) > 1) problems.push(`format ${w}x${h}`)
  }
  if (o.png) for (let p = 1; p <= Math.min(doc.numPages, o.pngPages ?? 1); p++) await savePng(doc, o.pngPages ? `${o.png}-p${p}` : o.png, 1.5, p)
  return { problems, info: `${doc.numPages} p, ${bytes.length} o` }
}

const jobs: Job[] = []
for (const t of templates) {
  for (const lang of LANGS)
    jobs.push({ name: `${t.id}/${lang}`, run: () => check(sampleCV(lang), designOf(t), { png: lang === 'fr' || lang === 'ar' ? `${t.id}-${lang}` : undefined }) })
  for (const lang of ['en', 'ar'] as const)
    jobs.push({ name: `${t.id}/${lang} long + photo`, run: () => check(longCV(lang), designOf(t), { minPages: 2, png: `long-${t.id}-${lang}`, pngPages: 2 }) })
  // Letter + niveaux en barres ; points + réglages extrêmes (grande police, grandes marges, interligne serré / aéré)
  jobs.push({ name: `${t.id}/fr Letter + barres`, run: () => check(sampleCV('fr'), designOf(t, { pageSize: 'LETTER', skillDisplay: 'bars' }), { size: [612, 792], png: `letter-${t.id}-fr` }) })
  jobs.push({ name: `${t.id}/en points, 115 %, marges larges`, run: () => check(longCV('en'), designOf(t, { skillDisplay: 'dots', fontScale: 1.15, margins: 'large', lineHeight: 1.6, photoShape: 'square' }), { minPages: 2, png: `max-${t.id}-en` }) })
  jobs.push({ name: `${t.id}/de 90 %, marges serrées, niveaux en texte`, run: () => check(sampleCV('de'), designOf(t, { skillDisplay: 'text', fontScale: 0.9, margins: 'compact', lineHeight: 1.2, accent: '#facc15' })) })
}
// Chaque paire de polices x langues latines, avec les 12 mois : le glyphe parasite se voit ici
for (const fontPair of FONT_PAIRS)
  for (const lang of ['fr', 'es', 'pt', 'de', 'it', 'en'] as const)
    jobs.push({ name: `police ${fontPair}/${lang}`, run: () => check(longCV(lang), { ...DEFAULT_DESIGN, templateId: 'classique-1', fontPair, skillDisplay: 'bars' }, { minPages: 2, png: lang === 'fr' ? `font-${fontPair}` : undefined }) })

let ko = 0
for (const [i, job] of jobs.entries()) {
  if (i % shards !== shard) continue
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
