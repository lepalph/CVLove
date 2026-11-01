import { useEffect, useRef } from 'react'
import type { PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist'

let pdfjs: Promise<typeof import('pdfjs-dist')> | undefined
/** pdf.js chargé à la demande ; le worker est de la même version (import ?url du même paquet). */
const loadPdfjs = () =>
  (pdfjs ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([lib, w]) => {
    lib.GlobalWorkerOptions.workerSrc = w.default
    return lib
  }))

interface Props {
  /** Fabrique les octets du PDF ; relancée quand `deps` change. `signal` : levé quand ce rendu est abandonné (nouveau rendu, démontage). */
  make: (signal: AbortSignal) => Promise<Uint8Array>
  deps: unknown[]
  /** Pages à afficher (1 = vignette). */
  maxPages?: number
  debounce?: number
  className?: string
  /** `pages` : nombre total de pages du PDF, donné avec 'ready'. */
  onState?: (s: 'busy' | 'ready' | 'error', pages?: number) => void
}

/**
 * Affiche le PDF en canvas. Double tampon : le nouveau rendu est peint hors écran
 * puis échangé d'un coup, l'ancien reste visible pendant ce temps (pas de clignotement).
 * Le rendu précédent est annulé (RenderTask.cancel) dès qu'un nouveau PDF arrive.
 */
export function PdfCanvas({ make, deps, maxPages = 20, debounce = 0, className, onState }: Props) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const abort = new AbortController()
    let dead = false // posé au nettoyage (démontage ou nouveau rendu) : ce rendu n'a plus le droit de peindre ni de signaler une erreur
    const tasks: RenderTask[] = []
    let loading: PDFDocumentLoadingTask | undefined
    const timer = setTimeout(async () => {
      onState?.('busy')
      try {
        const [lib, bytes] = await Promise.all([loadPdfjs(), make(abort.signal)])
        if (dead) return
        loading = lib.getDocument({ data: bytes })
        const doc = await loading.promise
        const width = host.current?.clientWidth || 600
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const canvases: HTMLCanvasElement[] = []
        for (let n = 1; n <= Math.min(doc.numPages, maxPages); n++) {
          const page = await doc.getPage(n)
          if (dead) return
          const base = page.getViewport({ scale: 1 })
          const viewport = page.getViewport({ scale: (width / base.width) * dpr })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.style.cssText = 'display:block;width:100%;height:auto'
          const task = page.render({ canvas, viewport })
          tasks.push(task)
          await task.promise
          canvases.push(canvas)
        }
        if (dead) return
        host.current?.replaceChildren(...canvases)
        onState?.('ready', doc.numPages)
      } catch (e) {
        if (!dead && (e as Error).name !== 'RenderingCancelledException') {
          console.error(e)
          onState?.('error')
        }
      }
    }, debounce)
    return () => {
      dead = true
      abort.abort()
      clearTimeout(timer)
      tasks.forEach((t) => t.cancel())
      void loading?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return <div ref={host} className={className} />
}
