import { useEffect, useState } from 'react'
import { extra } from '../i18n/extra'
import { guide } from '../i18n/guide'
import { tips } from '../i18n/tips'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { LANGS, type EditorMode } from '../model/types'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { useStore } from '../store'
import { LangSelect, Logo, Seg, useWide } from './bits'
import { externalCount } from './lib'

/** Mode Guidé / Complet : dans l'en-tête sur grand écran, en tête du panneau sur mobile (`MobileTools`) ; jamais les deux dans le DOM. */
function ModeSeg({ mode, onMode }: { mode: EditorMode; onMode: (m: EditorMode) => void }) {
  const g = guide[useStore((s) => s.uiLang)]
  return <Seg label={g.mode} value={mode} onChange={onMode} options={[['guided', g.guided], ['full', g.full]]} />
}

/** En-tête commun des éditeurs (CV et lettre) : une seule ligne sur mobile, qui ne colle pas quand l'écran est bas (voir `.edbar`). */
export function EdHeader({ mode, onMode, tab, onTab, onDownload, accent, note }: {
  mode: EditorMode; onMode: (m: EditorMode) => void; tab: 'edit' | 'preview'; onTab: (t: 'edit' | 'preview') => void; onDownload: () => void; accent?: string
  /** Confirmation visible (quelques secondes) sous le bouton Télécharger ; l'annonce vocale passe par la zone role=status de l'aperçu. */
  note?: string
}) {
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  const t = ui[uiLang]
  const wide = useWide()
  return (
    <header className="edbar border-b border-line bg-desk px-[var(--m)] py-2">
      <div className="a-logo flex items-center gap-1">
        <Logo accent={accent} />
        <a href="#/documents" className="btn btn-ghost whitespace-nowrap border-0 px-2" aria-label={v2[uiLang].docs} title={v2[uiLang].docs}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="fill-none stroke-current stroke-2 sm:hidden"><path d="M8 3h8l4 4v14H8z M4 7v14h4" strokeLinejoin="round" /></svg>
          <span className="max-sm:hidden">{v2[uiLang].docs}</span>
        </a>
      </div>
      {wide && <div className="a-mode"><ModeSeg mode={mode} onMode={onMode} /></div>}
      <div role="tablist" className="a-tabs flex rounded-ctl border border-edge p-0.5 lg:hidden">
        {(['edit', 'preview'] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => onTab(k)}
            className="min-h-10 flex-1 rounded-[4px] px-2 text-sm font-medium text-muted transition-colors duration-150 aria-selected:bg-ink aria-selected:text-desk sm:px-3">
            {k === 'edit' ? t.tabEdit : t.tabPreview}
          </button>
        ))}
      </div>
      {wide && <div className="a-lang"><LangSelect label={t.uiLang} value={uiLang} onChange={setUiLang} langs={LANGS} /></div>}
      {/* aria-disabled et non disabled : un bouton désactivé perd le focus, et le clavier retombait sur le haut de la page après le téléchargement. */}
      <button type="button" className="a-dl btn btn-primary whitespace-nowrap" onClick={onDownload}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="fill-none stroke-current stroke-2 sm:hidden"><path d="M12 4v11m-5-4 5 5 5-5M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="max-sm:sr-only">{t.download}</span>
      </button>
      {note && <p aria-hidden="true" className="absolute end-[var(--m)] top-full z-30 m-0 mt-1 rounded-ctl border border-line bg-panel px-3 py-2 text-sm font-medium shadow-sheet">{note}</p>}
    </header>
  )
}

/** Sur mobile, les réglages qui ne servent qu'une fois (mode, langue de l'interface) quittent l'en-tête pour le haut du panneau. */
export function MobileTools({ mode, onMode }: { mode: EditorMode; onMode: (m: EditorMode) => void }) {
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  if (useWide()) return null
  return (
    <div className="mb-5 flex items-center gap-2">
      <div className="flex-1"><ModeSeg mode={mode} onMode={onMode} /></div>
      <LangSelect label={ui[uiLang].uiLang} value={uiLang} onChange={setUiLang} langs={LANGS} />
    </div>
  )
}

/**
 * Colonne de l'aperçu : la feuille (nommée pour les lecteurs d'écran), un message quand le document est vide, un zoom sur mobile,
 * et la zone `role=status` où l'on annonce ce qui vient de changer (`said`). Le PDF n'est fabriqué que si l'aperçu est visible.
 */
export function PreviewPane({ make, deps, label, shown, empty, said, sample }: {
  make: () => Promise<Uint8Array>; deps: unknown[]; label: string; shown: boolean; empty: boolean; said: string
  /** Document vide : `make` rend l'exemple, signalé par une étiquette au lieu du message centré. */
  sample?: boolean
}) {
  const uiLang = useStore((s) => s.uiLang)
  const t = ui[uiLang]
  const x = extra[uiLang]
  const wide = useWide()
  const [state, setState] = useState<'busy' | 'ready' | 'error'>('busy')
  const [pages, setPages] = useState(0)
  const onState = (s: 'busy' | 'ready' | 'error', n?: number) => { setState(s); if (n) setPages(n) }
  const [zoom, setZoom] = useState(false)
  return (
    <div className={`${shown ? 'block' : 'hidden'} overflow-y-auto p-[var(--m)] lg:block lg:p-8`}>
      <div className="mb-3 flex justify-end lg:hidden">
        <button type="button" className="btn" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{x.zoom}</button>
      </div>
      <div className={zoom ? 'overflow-x-auto' : ''}>
        <div className={`relative mx-auto ${zoom ? 'w-[200%]' : 'w-full max-w-[46rem]'}`}>
          {empty && sample && <p aria-hidden="true" className="mb-3 text-center text-sm text-muted text-balance">{x.samplePreview}</p>}
          {/* Les pages sont séparées par du fond (gap) ; la feuille blanche d'attente n'est là que tant qu'aucune page n'a été rendue. */}
          <div role="img" aria-label={label} className={`relative min-h-[20rem] ${pages ? '' : 'bg-white shadow-sheet'}`}>
            {(wide || shown) && <PdfCanvas className="grid gap-4 [&_canvas]:shadow-sheet" make={make} deps={[...deps, zoom]} debounce={300} onState={onState} />}
            {empty && !sample && <p aria-hidden="true" className="absolute inset-x-0 top-1/3 m-0 px-10 text-center text-sm text-neutral-500">{x.emptyPreview}</p>}
          </div>
        </div>
      </div>
      <p aria-hidden="true" className="mt-3 text-center text-sm text-muted">{state === 'busy' ? t.previewBusy : state === 'error' ? t.previewError : ' '}</p>
      {state === 'ready' && pages > 1 && <p className="mt-1 text-center text-sm text-muted">{tips[uiLang].pages.replace('{n}', String(pages))}</p>}
      <p role="status" className="sr-only">{said}</p>
    </div>
  )
}

/** Pied d'éditeur : compteur « 0 requête vers un autre site » mesuré en direct, et comment le vérifier soi-même. */
export function EdFooter() {
  const x = extra[useStore((s) => s.uiLang)]
  const [n, setN] = useState(0)
  useEffect(() => {
    const count = () => setN(externalCount(performance.getEntriesByType('resource').map((e) => e.name), location.origin))
    count()
    const po = new PerformanceObserver(count)
    po.observe({ type: 'resource', buffered: true })
    return () => po.disconnect()
  }, [])
  return (
    <footer className="flex h-10 items-center gap-4 border-t border-line bg-desk px-[var(--m)] text-xs text-muted">
      <p className="m-0 flex items-center gap-2 font-mono" role="status">
        <span aria-hidden="true" className={`size-2 rounded-full ${n === 0 ? 'bg-emerald-600' : 'bg-danger'}`} />
        {(n <= 1 ? x.netOne : x.netMany).replace('{n}', String(n))}
      </p>
      <details className="relative">
        <summary className="flex min-h-10 cursor-pointer list-none items-center underline underline-offset-4 [&::-webkit-details-marker]:hidden">{x.netHow}</summary>
        <p className="absolute bottom-full start-0 z-30 mb-1 w-[min(22rem,calc(100vw-2rem))] rounded-card border border-line bg-panel p-4 text-sm leading-relaxed text-ink shadow-sheet">{x.netHelp}</p>
      </details>
    </footer>
  )
}
