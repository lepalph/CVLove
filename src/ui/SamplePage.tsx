import { useEffect, useRef, useState } from 'react'
import { DEFAULT_DESIGN } from '../model/cv'
import { sampleCV } from '../model/sample'
import type { Design, Lang } from '../model/types'
import { renderLazy } from '../pdf/lazy'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { getTemplate } from '../templates'

/** PDF d'exemple mis en cache : hero, grille et vignettes de l'éditeur ne fabriquent chacun qu'une fois. */
const cache = new Map<string, Promise<Uint8Array>>()
const sampleBytes = (lang: Lang, templateId: string, custom?: Design['custom']) => {
  const key = `${lang}|${templateId}|${custom?.accent ?? ''}|${custom?.fontPair ?? ''}`
  let p = cache.get(key)
  if (!p) {
    p = renderLazy(sampleCV(lang), { ...DEFAULT_DESIGN, ...getTemplate(templateId).preset, templateId, ...custom })
    p.catch(() => cache.delete(key)) // un échec (réseau coupé pendant le chargement d'un chunk) ne doit pas rester en cache : on réessaiera
    cache.set(key, p)
  }
  return p.then((b) => b.slice()) // pdf.js détache le buffer qu'on lui donne
}

/**
 * Feuille A4 réelle (rendu PDF de l'exemple avec le preset du modèle). Le cadre a ses dimensions finales dès le premier rendu,
 * avec un squelette dessous ; le PDF n'est fabriqué qu'à l'approche de l'écran (sauf `eager`).
 */
export function SamplePage({ lang, templateId, custom, eager, className = '' }: { lang: Lang; templateId: string; custom?: Design['custom']; eager?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(!!eager)
  useEffect(() => {
    if (near || !ref.current) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '300px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [near])
  return (
    <div ref={ref} className={`relative aspect-[1/1.414] overflow-hidden bg-white shadow-sheet ${className}`}>
      <div className="skeleton motion-safe:animate-pulse" aria-hidden="true" />
      {near && <PdfCanvas className="relative" make={() => sampleBytes(lang, templateId, custom)} deps={[lang, templateId, custom?.accent, custom?.fontPair]} maxPages={1} />}
    </div>
  )
}
