import type { CV, Design, Letter } from '../model/types'

/** react-pdf et les templates sont chargés au premier besoin, pas dans le bundle initial. Téléchargement et vignettes : fil principal. */
export const renderLazy = (cv: CV, design: Design) => import('./render').then((m) => m.renderPdf(cv, design))
export const renderLetterLazy = (letter: Letter, design: Design) => import('./render').then((m) => m.renderLetterPdf(letter, design))

/**
 * Aperçu de l'éditeur : rendu dans un Web Worker (render.worker.ts) pour ne pas figer la saisie (docs/wiki/performance-apercu.md).
 * Un rendu à la fois ; seule la dernière demande attend son tour, les demandes dépassées (remplacées ou `signal` levé) sont abandonnées.
 * Un rendu commencé ne s'interrompt pas (react-pdf est synchrone) : son résultat est jeté par PdfCanvas.
 * Worker indisponible ou qui ne se charge pas : repli sur le fil principal, comme avant.
 */
type Job = { kind: 'cv' | 'letter'; doc: CV | Letter; design: Design; signal: AbortSignal; ok: (b: Uint8Array) => void; ko: (e: unknown) => void }
let worker: Worker | null | undefined // null : indisponible
let running: Job | undefined
let waiting: Job | undefined

const aborted = () => new DOMException('Rendu dépassé', 'AbortError')
const onMain = (j: Job) => (j.kind === 'letter' ? renderLetterLazy(j.doc as Letter, j.design) : renderLazy(j.doc as CV, j.design)).then(j.ok, j.ko)

function getWorker() {
  if (worker !== undefined) return worker
  if (typeof Worker === 'undefined') return (worker = null)
  worker = new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = ({ data }: MessageEvent<{ bytes?: Uint8Array; error?: string }>) => {
    const j = running!
    running = undefined
    if (data.bytes) j.ok(data.bytes)
    else j.ko(new Error(data.error))
    pump()
  }
  worker.onerror = (e) => { // script du worker introuvable ou en erreur au chargement
    console.error(e)
    worker?.terminate()
    worker = null
    const j = running
    running = undefined
    if (j) onMain(j)
    pump()
  }
  return worker
}

function pump() {
  if (running || !waiting) return
  const j = waiting
  waiting = undefined
  if (j.signal.aborted) return j.ko(aborted())
  const w = getWorker()
  if (!w) return void onMain(j)
  running = j
  w.postMessage({ kind: j.kind, doc: j.doc, design: j.design })
}

const preview = (kind: Job['kind'], doc: CV | Letter, design: Design, signal: AbortSignal) =>
  new Promise<Uint8Array>((ok, ko) => {
    waiting?.ko(aborted())
    waiting = { kind, doc, design, signal, ok, ko }
    pump()
  })
export const previewLazy = (cv: CV, design: Design, signal: AbortSignal) => preview('cv', cv, design, signal)
export const previewLetterLazy = (letter: Letter, design: Design, signal: AbortSignal) => preview('letter', letter, design, signal)
