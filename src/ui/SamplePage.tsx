import { useEffect, useRef, useState } from 'react'
import { sampleCV } from '../model/sample'
import type { Lang } from '../model/types'
import { renderLazy } from '../pdf/lazy'
import { PdfCanvas } from '../pdf/PdfCanvas'

/** PDF d'exemple mis en cache : hero, grille et vignettes de l'éditeur ne fabriquent chacun qu'une fois. */
const cache = new Map<string, Promise<Uint8Array>>()
const sampleBytes = (lang: Lang, templateId: string, accent?: string) => {
  const key = `${lang}|${templateId}|${accent ?? ''}`
  let p = cache.get(key)
  if (!p) cache.set(key, (p = renderLazy({ ...sampleCV(lang), templateId, ...(accent ? { accent } : {}) })))
  return p.then((b) => b.slice()) // pdf.js détache le buffer qu'on lui donne
}

/**
 * Feuille A4 réelle (rendu PDF de l'exemple). Le cadre a ses dimensions finales dès le premier rendu,
 * avec un squelette dessous ; le PDF n'est fabriqué qu'à l'approche de l'écran (sauf `eager`).
 */
export function SamplePage({ lang, templateId, accent, eager, className = '' }: { lang: Lang; templateId: string; accent?: string; eager?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(!!eager)
  useEffect(() => {
    if (near || !ref.current) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '300px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [near])
  return (
    <div ref={ref} className={`relative aspect-[210/297] overflow-hidden bg-white shadow-sheet ${className}`}>
      <div className="skeleton motion-safe:animate-pulse" aria-hidden="true" />
      {near && <PdfCanvas className="relative" make={() => sampleBytes(lang, templateId, accent)} deps={[lang, templateId, accent]} maxPages={1} />}
    </div>
  )
}
