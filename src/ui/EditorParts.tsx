import { useEffect, useRef, useState } from 'react'
import { extra } from '../i18n/extra'
import { guide } from '../i18n/guide'
import { letterUi } from '../i18n/letter'
import { tips } from '../i18n/tips'
import { ui } from '../i18n/ui'
import { shell } from '../i18n/shell'
import { v2 } from '../i18n/v2'
import { exportDocs, parseImport } from '../model/documents'
import { MAX_IMPORT_BYTES } from '../model/sanitize'
import { LANGS, type Doc, type EditorMode } from '../model/types'
import { pagesText as pagesTexts } from '../i18n/pages'
import { MAX_PAGES, PdfCanvas } from '../pdf/PdfCanvas'
import { useStore } from '../store'
import { LangSelect, Logo, Seg, useWide } from './bits'
import { importAndOpen } from './Documents'
import { externalCount, isEmptyCV } from './lib'

/** Mode Guidé / Complet : dans l'en-tête sur grand écran, en tête du panneau sur mobile (`MobileTools`) ; jamais les deux dans le DOM. */
function ModeSeg({ mode, onMode }: { mode: EditorMode; onMode: (m: EditorMode) => void }) {
  const g = guide[useStore((s) => s.uiLang)]
  return <Seg label={g.mode} value={mode} onChange={onMode} options={[['guided', g.guided], ['full', g.full]]} />
}

/**
 * Menu Fichier : enregistrer le document en JSON, ouvrir un JSON. Si le document en cours a du contenu et que le fichier contient
 * un seul document du même type, on demande : le remplacer, ou ajouter le fichier comme nouveau document (sinon : ajout direct).
 */
function FileMenu({ doc }: { doc: Doc }) {
  const uiLang = useStore((s) => s.uiLang)
  const t = ui[uiLang]
  const tv = v2[uiLang]
  const ref = useRef<HTMLDetailsElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const ask = useRef<HTMLDialogElement>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>()
  const [pending, setPending] = useState<{ json: string; src: Doc }>()
  const summary = useRef<HTMLElement>(null)
  const close = () => { ref.current?.removeAttribute('open'); summary.current?.focus() } // le focus revient au déclencheur
  const onExport = () => {
    const url = URL.createObjectURL(new Blob([exportDocs([doc])], { type: 'application/json' }))
    Object.assign(document.createElement('a'), { href: url, download: `${doc.name.replace(/[^\p{L}\p{N}]+/gu, '-') || 'cvlove'}.json` }).click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    close()
  }
  const add = (json: string) => {
    importAndOpen(json)
    const kind = useStore.getState().documents.find((d) => d.id === useStore.getState().activeId)?.kind
    location.hash = kind === 'letter' ? '#/lettre' : '#/editeur'
    setMsg({ ok: true, text: extra[uiLang].fileImported })
  }
  const onImport = async (f?: File) => {
    if (!f) return
    close()
    if (f.size > MAX_IMPORT_BYTES) return setMsg({ ok: false, text: extra[uiLang].tooBig.replace('{mb}', String(MAX_IMPORT_BYTES / 1e6)) })
    try {
      const json = await f.text()
      const docs = parseImport(json) // valide avant de poser la question
      const empty = doc.kind === 'cv' && isEmptyCV(doc.data)
      if (empty || docs.length !== 1 || docs[0].kind !== doc.kind) return add(json)
      setPending({ json, src: docs[0] })
      ask.current?.showModal()
    } catch {
      setMsg({ ok: false, text: t.importError })
    }
  }
  const choose = (how: 'replace' | 'add') => {
    ask.current?.close()
    if (!pending) return
    if (how === 'replace') {
      const ok = useStore.getState().replaceDoc(doc.id, pending.src)
      setMsg(ok ? { ok, text: extra[uiLang].fileImported } : { ok, text: t.importError })
    } else add(pending.json)
    setPending(undefined)
  }
  // <details> ne se referme pas seul : clic extérieur ici, sortie du focus par `onBlur` plus bas.
  useEffect(() => {
    const out = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) ref.current?.removeAttribute('open') }
    document.addEventListener('pointerdown', out)
    return () => document.removeEventListener('pointerdown', out)
  }, [])
  useEffect(() => {
    if (!msg) return
    const id = setTimeout(() => setMsg(undefined), 6000)
    return () => clearTimeout(id)
  }, [msg])
  return (
    <div className="relative">
      <details ref={ref} onBlur={(e) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.removeAttribute('open') }} onKeyDown={(e) => { if (e.key === 'Escape' && ref.current?.open) { e.preventDefault(); close() } }}>
        <summary ref={summary} className="btn list-none whitespace-nowrap [&::-webkit-details-marker]:hidden">{tv.file}</summary>
        <div className="absolute start-0 top-full z-30 mt-1 flex w-max flex-col gap-1 rounded-card border border-line bg-panel p-2 shadow-sheet lg:start-auto lg:end-0">
          <button type="button" className="btn btn-ghost justify-start" onClick={onExport}>{t.exportJson}</button>
          <button type="button" className="btn btn-ghost justify-start" onClick={() => fileRef.current?.click()}>{t.importJson}</button>
        </div>
      </details>
      <input id="imp" ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { void onImport(e.target.files?.[0]); e.target.value = '' }} />
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`absolute start-0 top-full z-30 m-0 mt-1 w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-ctl border border-line bg-panel px-3 py-2 text-sm shadow-sheet lg:start-auto lg:end-0 ${msg.ok ? '' : 'text-danger'}`}>{msg.text}</p>}
      <dialog ref={ask} aria-labelledby="import-title" onClose={() => { setPending(undefined); summary.current?.focus() }}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-card border border-line bg-panel p-6 text-ink shadow-sheet backdrop:bg-black/40">
        <h2 id="import-title" className="m-0 text-lg font-semibold tracking-tight">{tv.importTitle}</h2>
        <div className="mt-4 flex flex-col gap-2">
          {/* L'ajout, sans perte, vient en premier : showModal() lui donne le focus. */}
          <button type="button" className="btn btn-primary justify-start" onClick={() => choose('add')}>{tv.importAdd}</button>
          <button type="button" className="btn justify-start" onClick={() => choose('replace')}>{tv.importReplace.replace('{name}', `\u2068${doc.name}\u2069`)}</button>
          <button type="button" className="btn btn-ghost" onClick={() => ask.current?.close()}>{letterUi[uiLang].cancel}</button>
        </div>
      </dialog>
    </div>
  )
}

/** En-tête commun des éditeurs (CV et lettre) : une seule ligne sur mobile, qui ne colle pas quand l'écran est bas (voir `.edbar`). */
export function EdHeader({ doc, mode, onMode, tab, onTab, onDownload, accent, note }: {
  doc: Doc; mode: EditorMode; onMode: (m: EditorMode) => void; tab: 'edit' | 'preview'; onTab: (t: 'edit' | 'preview') => void; onDownload: () => void; accent?: string
  /** Confirmation visible (quelques secondes) sous le bouton Télécharger ; l'annonce vocale passe par la zone role=status de l'aperçu. */
  note?: string
}) {
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  const t = ui[uiLang]
  const wide = useWide()
  return (
    <header className="edbar border-b border-line bg-desk px-[var(--m)] py-2">
      <h1 className="sr-only">{location.hash.startsWith('#/lettre') ? shell[uiLang].titleLetter : shell[uiLang].titleEditor}</h1>
      <div className="a-logo flex items-center gap-1">
        <Logo accent={accent} />
        <a href="#/documents" className="btn btn-ghost whitespace-nowrap border-0 px-2" aria-label={v2[uiLang].docs} title={v2[uiLang].docs}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="fill-none stroke-current stroke-2 sm:hidden"><path d="M8 3h8l4 4v14H8z M4 7v14h4" strokeLinejoin="round" /></svg>
          <span className="max-sm:hidden">{v2[uiLang].docs}</span>
        </a>
      </div>
      {wide && <div className="a-mode"><ModeSeg mode={mode} onMode={onMode} /></div>}
      <div role="group" aria-label={shell[uiLang].view} className="a-tabs flex rounded-ctl border border-edge p-0.5 lg:hidden">
        {(['edit', 'preview'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => onTab(k)}
            className="min-h-11 flex-1 rounded-[4px] px-2 text-sm font-medium text-muted transition-colors duration-150 aria-pressed:bg-ink aria-pressed:text-desk sm:px-3">
            {k === 'edit' ? t.tabEdit : t.tabPreview}
          </button>
        ))}
      </div>
      {wide && <div className="a-lang"><LangSelect label={t.uiLang} value={uiLang} onChange={setUiLang} langs={LANGS} /></div>}
      {/* aria-disabled et non disabled : un bouton désactivé perd le focus, et le clavier retombait sur le haut de la page après le téléchargement. */}
      <div className="a-dl flex items-center gap-2">
        {wide && <FileMenu doc={doc} />}
        <button type="button" className="btn btn-primary whitespace-nowrap" onClick={onDownload}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="fill-none stroke-current stroke-2 sm:hidden"><path d="M12 4v11m-5-4 5 5 5-5M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="max-sm:sr-only">{t.download}</span>
        </button>
      </div>
      {note && <p aria-hidden="true" className="absolute end-[var(--m)] top-full z-30 m-0 mt-1 rounded-ctl border border-line bg-panel px-3 py-2 text-sm font-medium shadow-sheet">{note}</p>}
    </header>
  )
}

/** Sur mobile, les réglages qui ne servent qu'une fois (mode, langue de l'interface) quittent l'en-tête pour le haut du panneau. */
export function MobileTools({ doc, mode, onMode }: { doc: Doc; mode: EditorMode; onMode: (m: EditorMode) => void }) {
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  if (useWide()) return null
  return (
    <div className="mb-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1"><ModeSeg mode={mode} onMode={onMode} /></div>
        <LangSelect label={ui[uiLang].uiLang} value={uiLang} onChange={setUiLang} langs={LANGS} />
      </div>
      <div className="flex items-center gap-2"><FileMenu doc={doc} /></div>
    </div>
  )
}

/**
 * Colonne de l'aperçu : la feuille (nommée pour les lecteurs d'écran), un message quand le document est vide, un zoom sur mobile,
 * et la zone `role=status` où l'on annonce ce qui vient de changer (`said`). Le PDF n'est fabriqué que si l'aperçu est visible.
 */
/** Flèche de la barre de pages ; elle se retourne en arabe (RTL) pour suivre le sens de lecture. */
function Chevron({ next }: { next?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`size-4 ${next ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0'}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
  )
}

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
  const sheet = useRef<HTMLDivElement>(null)
  const pagesText = tips[uiLang].pages.replace('{n}', String(pages))
  const [current, setCurrent] = useState(0)
  const shownPages = Math.min(pages, MAX_PAGES)
  const cur = Math.min(current, Math.max(shownPages - 1, 0))
  const pt = pagesTexts[uiLang]
  // Page courante = celle dont la plus grande part est visible ; les canvas sont remplacés à chaque rendu, donc on réobserve à chaque « ready ».
  useEffect(() => {
    const cs = [...(sheet.current?.querySelectorAll('canvas') ?? [])]
    if (state !== 'ready' || cs.length < 2) return
    const seen = new Map<Element, number>()
    const io = new IntersectionObserver((es) => {
      for (const e of es) seen.set(e.target, e.isIntersecting ? e.intersectionRect.height : 0)
      let best = -1, h = 0
      cs.forEach((c, i) => { const v = seen.get(c) ?? 0; if (v > h) { h = v; best = i } })
      if (best >= 0) setCurrent(best)
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) })
    cs.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [state, pages])
  const goPage = (i: number) => sheet.current?.querySelectorAll('canvas')[i]?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  return (
    <>
      <div className={`${shown ? 'block' : 'hidden'} overflow-y-auto p-[var(--m)] lg:block lg:p-8`}>
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2 bg-desk lg:sticky lg:-top-8 lg:z-10 lg:py-2">
          {/* Plusieurs pages : annoncées en haut (avant, seulement sous la dernière) avec un saut direct vers chacune. */}
          {pages > 1 && ( // `pages` survit au rendu suivant : la barre ne disparaît pas à chaque frappe
            <div role="group" aria-label={pagesText} className="me-auto flex flex-wrap items-center gap-1 text-sm text-muted">
              <span aria-hidden="true" className="me-1">{pagesText}</span>
              <button type="button" className="btn btn-ghost px-2" aria-label={pt.prev} disabled={cur === 0} onClick={() => goPage(cur - 1)}><Chevron /></button>
              {Array.from({ length: shownPages }, (_, i) => (
                <button key={i} type="button" className={`btn btn-ghost min-w-11 px-2 ${i === cur ? 'bg-sunk font-semibold text-ink' : ''}`} aria-current={i === cur ? 'page' : undefined} aria-label={tips[uiLang].page.replace('{n}', String(i + 1))} onClick={() => goPage(i)}>{i + 1}</button>
              ))}
              <button type="button" className="btn btn-ghost px-2" aria-label={pt.next} disabled={cur >= shownPages - 1} onClick={() => goPage(cur + 1)}><Chevron next /></button>
            </div>
          )}
          <button type="button" className="btn lg:hidden" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{x.zoom}</button>
        </div>
        <div className={zoom ? 'overflow-x-auto' : ''}>
          <div className={`relative mx-auto ${zoom ? 'w-[200%]' : 'w-full max-w-[46rem]'}`}>
            {empty && sample && <p aria-hidden="true" className="mb-3 text-center text-sm text-muted text-balance">{x.samplePreview}</p>}
            {/* Les pages sont séparées par du fond (gap) ; la feuille blanche d'attente n'est là que tant qu'aucune page n'a été rendue. */}
            <div ref={sheet} role="img" aria-label={label} className={`relative min-h-[20rem] ${pages ? '' : 'bg-white shadow-sheet'}`}>
              {(wide || shown) && <PdfCanvas className="grid gap-4 [&_canvas]:shadow-sheet [&_canvas]:scroll-mt-16" make={make} deps={[...deps, zoom]} debounce={300} onState={onState} />}
              {empty && !sample && <p aria-hidden="true" className="absolute inset-x-0 top-1/3 m-0 px-10 text-center text-sm text-neutral-500">{x.emptyPreview}</p>}
            </div>
          </div>
        </div>
        {pages > MAX_PAGES && <p className="mt-3 text-center text-sm text-muted text-balance">{pt.limited.replace('{shown}', String(MAX_PAGES)).replace('{total}', String(pages))}</p>}
        {/* « En cours » n'est que visuel (il changerait à chaque frappe) ; l'échec, lui, est annoncé. */}
        {state === 'error'
          ? <p role="alert" className="mt-3 text-center text-sm text-danger">{t.previewError}</p>
          : <p aria-hidden="true" className="mt-3 text-center text-sm text-muted">{state === 'busy' ? t.previewBusy : ' '}</p>}
      </div>
      {/* Hors du panneau : masqué (display:none) sur mobile quand l'onglet Modifier est actif, il ne serait pas annoncé. */}
      <p role="status" className="sr-only">{said}</p>
    </>
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
    <footer className="relative flex h-10 items-center gap-4 border-t border-line bg-desk px-[var(--m)] text-xs text-muted">
      <p className="m-0 flex items-center gap-2 font-mono" role="status">
        <span aria-hidden="true" className={`size-2 rounded-full ${n === 0 ? 'bg-emerald-600' : 'bg-danger'}`} />
        {(n <= 1 ? x.netOne : x.netMany).replace('{n}', String(n))}
      </p>
      <details>
        <summary className="flex min-h-10 cursor-pointer list-none items-center underline underline-offset-4 [&::-webkit-details-marker]:hidden">{x.netHow}</summary>
        <p className="absolute bottom-full start-[var(--m)] z-30 mb-1 w-[min(22rem,calc(100vw-2rem))] rounded-card border border-line bg-panel p-4 text-sm leading-relaxed text-ink shadow-sheet">{x.netHelp}</p>
      </details>
    </footer>
  )
}
