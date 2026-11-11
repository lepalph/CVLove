import './worker-dev'
import { renderLetterPdf, renderPdf } from './render'

/** Rendu de l'aperçu hors du fil principal (voir lazy.ts) : react-pdf et fontkit n'ont besoin ni du DOM ni de window. */
self.onmessage = async ({ data: { kind, doc, design } }: MessageEvent) => {
  try {
    const bytes = kind === 'letter' ? await renderLetterPdf(doc, design) : await renderPdf(doc, design)
    self.postMessage({ bytes }, { transfer: [bytes.buffer] })
  } catch (e) {
    self.postMessage({ error: String((e as Error)?.message ?? e) })
  }
}
