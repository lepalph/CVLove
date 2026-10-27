// pnpm check:pdf : rend chaque template x langue, vérifie le texte extractible et les libellés, exporte la page 1 en PNG dans out/.
import { createCanvas } from '@napi-rs/canvas'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { cvLabels } from '../src/i18n/labels'
import { visibleSections } from '../src/model/cv'
import { formatMonth } from '../src/model/dates'
import { sampleCV } from '../src/model/sample'
import { LANGS } from '../src/model/types'
import { renderPdf } from '../src/pdf/render'
import { templates } from '../src/templates'

const fonts = fileURLToPath(new URL('../public/fonts/', import.meta.url))
const out = fileURLToPath(new URL('../out/', import.meta.url))
mkdirSync(out, { recursive: true })
// Extraction arabe : react-pdf inverse les ligatures lam-alef (« الآن » -> « اآلن ») et réordonne les groupes de
// mots mixtes ; on compare donc mot à mot, sans espaces, ni ل/ا, ni voyelles brèves (rendu visuel : voir les PNG).
const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/[\u064b-\u065f\u0640\sلا]/g, '')
let failures = 0
let count = 0

for (const t of templates) {
  for (const lang of LANGS) {
    const cv = { ...sampleCV(lang), templateId: t.id }
    const bytes = await renderPdf(cv, fonts)
    const doc = await getDocument({ data: bytes.slice(), useSystemFonts: false, verbosity: 0 }).promise
    let text = ''
    for (let p = 1; p <= doc.numPages; p++) {
      const c = await (await doc.getPage(p)).getTextContent()
      text += c.items.map((i) => ('str' in i ? i.str : '')).join(' ') + ' '
    }
    const labels = cvLabels[lang]
    const expected = [
      ...visibleSections(cv).map((s) => labels.sections[s.kind]),
      labels.present,
      formatMonth('2021-03', lang),
      cv.personal.firstName,
    ]
    const hayN = norm(text)
    const missing = expected.flatMap((e) => e.split(/\s+/)).filter((w) => norm(w) && !hayN.includes(norm(w)))
    const ctrl = lang !== 'ar' && /[\u0000-\u0008\u000e-\u001f]/.test(text)
    const ok = missing.length === 0 && !ctrl && doc.numPages >= 1
    if (!ok) failures++
    count++
    console.log(`${ok ? 'OK ' : 'KO '} ${t.id}/${lang}  ${doc.numPages} p, ${bytes.length} o${missing.length ? '  manquants : ' + missing.join(' | ') : ''}${ctrl ? '  caractères de contrôle dans le texte extrait' : ''}`)

    const page = await doc.getPage(1)
    const vp = page.getViewport({ scale: 1.6 })
    const canvas = createCanvas(vp.width, vp.height)
    // @ts-expect-error contexte napi-rs accepté par pdf.js en Node
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp, canvas }).promise
    writeFileSync(`${out}${t.id}-${lang}.png`, canvas.toBuffer('image/png'))
  }
}
// Cas limites : texte long sur plusieurs pages + photo (la page 2 doit exister et rester lisible)
for (const t of templates) {
  for (const lang of ['en', 'ar'] as const) {
    const cv = { ...sampleCV(lang), templateId: t.id }
    const exp = cv.sections.find((s) => s.kind === 'experience')!
    exp.items = Array.from({ length: 12 }, (_, i) => ({ ...exp.items[i % 2], id: `x${i}`, text: exp.items[i % 2].text.repeat(3) }))
    const photo = createCanvas(64, 64)
    const g = photo.getContext('2d')
    g.fillStyle = '#888'
    g.fillRect(0, 0, 64, 64)
    cv.personal.photo = `data:image/png;base64,${photo.toBuffer('image/png').toString('base64')}`
    const doc = await getDocument({ data: (await renderPdf(cv, fonts)).slice(), verbosity: 0 }).promise
    for (let p = 1; p <= Math.min(doc.numPages, 2); p++) {
      const page = await doc.getPage(p)
      const vp = page.getViewport({ scale: 1.2 })
      const canvas = createCanvas(vp.width, vp.height)
      // @ts-expect-error contexte napi-rs accepté par pdf.js en Node
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp, canvas }).promise
      writeFileSync(`${out}long-${t.id}-${lang}-p${p}.png`, canvas.toBuffer('image/png'))
    }
    const ok = doc.numPages >= 2
    if (!ok) failures++
    count++
    console.log(`${ok ? 'OK ' : 'KO '} ${t.id}/${lang}  long + photo : ${doc.numPages} pages`)
  }
}
console.log(`${count - failures}/${count} rendus valides`)
process.exit(failures ? 1 : 0)
