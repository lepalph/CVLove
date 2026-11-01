import { useEffect, useRef, useState } from 'react'
import { DEFAULT_DESIGN } from '../model/cv'
import { sampleCV } from '../model/sample'
import type { Design, Lang } from '../model/types'
import { renderLazy } from '../pdf/lazy'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { getTemplate } from '../templates'
import { SAMPLE_PHOTO } from './samplePhoto'

/** PDF d'exemple mis en cache (hero, grille, vignettes de l'éditeur ne fabriquent chacun qu'une fois), LRU : au-delà de MAX, la plus ancienne est jetée. */
const MAX = 40
const cache = new Map<string, Promise<Uint8Array>>()
const keyOf = (lang: Lang, templateId: string, custom: Design['custom']) => `${lang}|${templateId}|${custom?.accent ?? ''}|${custom?.fontPair ?? ''}`
const render = (lang: Lang, templateId: string, custom: Design['custom']) => {
  const key = keyOf(lang, templateId, custom)
  let p = cache.get(key)
  if (p) cache.delete(key) // réinsérée en dernier ci-dessous : la Map garde l'ordre d'usage
  else {
    const tpl = getTemplate(templateId)
    const cv = sampleCV(lang)
    if (tpl.photo) cv.personal.photo = SAMPLE_PHOTO
    const q = (p = renderLazy(cv, { ...DEFAULT_DESIGN, ...tpl.preset, templateId, ...custom }))
    q.catch(() => cache.get(key) === q && cache.delete(key)) // un échec (réseau coupé pendant le chargement d'un chunk) ne doit pas rester en cache : on réessaiera
  }
  cache.set(key, p)
  if (cache.size > MAX) cache.delete(cache.keys().next().value!)
  return p
}

/**
 * File globale : react-pdf bloque le thread principal, donc un seul PDF d'exemple à la fois, dans l'ordre d'arrivée.
 * Une demande abandonnée (vignette sortie de l'écran ou réglage changé : `signal`) est sautée sans rien fabriquer.
 */
const waiting: { signal: AbortSignal; run: () => Promise<unknown> }[] = []
let busy = false
const pump = () => {
  const w = !busy && waiting.shift()
  if (!w) return
  if (w.signal.aborted) return pump()
  busy = true
  Promise.resolve().then(w.run).catch(() => {}).finally(() => { busy = false; pump() }) // l'erreur (même levée tout de suite) est traitée par celui qui a demandé
}
/** Sans `signal` (hero) ou déjà en cache : tout de suite, hors file. */
const sampleBytes = (lang: Lang, templateId: string, custom: Design['custom'], signal?: AbortSignal) =>
  (!signal || cache.has(keyOf(lang, templateId, custom))
    ? render(lang, templateId, custom)
    : new Promise<Uint8Array>((resolve, reject) => {
        waiting.push({ signal, run: () => { const p = render(lang, templateId, custom); p.then(resolve, reject); return p } })
        pump()
      })
  ).then((b) => b.slice()) // pdf.js détache le buffer qu'on lui donne

/**
 * Feuille A4 réelle (rendu PDF de l'exemple avec le preset du modèle). Le cadre a ses dimensions finales dès le premier rendu,
 * avec un squelette dessous ; le PDF n'est fabriqué que pour une vignette à l'écran (ou presque), en file, et le canvas est
 * libéré quand elle en sort. `eager` : tout de suite, hors file. Un changement de couleur ou de police attend 400 ms de calme.
 * Décorative : le nom du modèle est porté par le bouton ou le texte autour.
 */
export function SamplePage({ lang, templateId, custom, eager, className = '' }: { lang: Lang; templateId: string; custom?: Design['custom']; eager?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(!!eager)
  useEffect(() => {
    if (eager || !ref.current) return
    // root : la galerie qui défile (sinon la marge s'appliquerait à la fenêtre et serait sans effet dans la galerie)
    const io = new IntersectionObserver((e) => setNear(e[e.length - 1].isIntersecting), { root: ref.current.parentElement?.closest('.overflow-y-auto'), rootMargin: '100px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [eager])
  const [look, setLook] = useState(custom) // `custom` après 400 ms de calme
  useEffect(() => {
    const t = setTimeout(() => setLook((l) => (l?.accent === custom?.accent && l?.fontPair === custom?.fontPair ? l : custom)), 400)
    return () => clearTimeout(t)
  }, [custom?.accent, custom?.fontPair]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={ref} aria-hidden="true" className={`relative aspect-[1/1.414] overflow-hidden bg-white shadow-sheet ${className}`}>
      <div className="skeleton motion-safe:animate-pulse" />
      {near && (
        <PdfCanvas className="relative" maxPages={1} deps={[lang, templateId, look?.accent, look?.fontPair]}
          make={(signal) => sampleBytes(lang, templateId, look, eager ? undefined : signal)} />
      )}
    </div>
  )
}
