import { useRef, useState, type PointerEvent as RPointerEvent } from 'react'

export interface Drag { id: string; /** Décalage vertical de la section tenue. */ dy: number; /** Rang d'arrivée dans la liste affichée. */ pos: number; /** Y de la barre d'insertion, relatif à la liste. */ bar: number }

const scrollParent = (el: HTMLElement): HTMLElement | Window => {
  for (let p = el.parentElement; p; p = p.parentElement) if (/(auto|scroll)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight) return p
  return window
}

/**
 * Glisser-déposer des sections en pointer events (souris et tactile ; la poignée porte `touch-action: none`).
 * `ids` = sections affichées, dans l'ordre ; `onDrop(id, rang)` est appelé une seule fois au lâcher (rang dans `ids`). Échap ou annulation du pointeur : rien ne change.
 * La section tenue suit le pointeur par `transform` (le DOM ne bouge pas avant le lâcher) ; le défilement automatique agit près des bords du panneau.
 */
export function useSectionDrag(ids: string[], onDrop: (id: string, pos: number) => void) {
  const list = useRef<HTMLUListElement>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const start = (e: RPointerEvent<HTMLElement>, id: string) => {
    const ul = list.current
    const idx = ids.indexOf(id)
    if (!ul || idx < 0 || ids.length < 2 || (e.pointerType === 'mouse' && e.button !== 0)) return
    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)
    const sc = scrollParent(ul)
    const top = () => (sc instanceof Window ? sc.scrollY : sc.scrollTop)
    const y0 = e.clientY, s0 = top()
    let y = y0, pos = idx, raf = 0
    const calc = () => {
      const others = [...ul.children].filter((_, k) => k !== idx).map((li) => li.getBoundingClientRect())
      pos = others.filter((r) => r.top + r.height / 2 < y).length
      const edge = pos < others.length ? others[pos].top - 12 : others[others.length - 1].bottom + 12 // 12 = moitié de gap-6
      setDrag({ id, dy: y - y0 + top() - s0, pos, bar: edge - ul.getBoundingClientRect().top })
    }
    const tick = () => {
      const b = sc instanceof Window ? { top: 0, bottom: innerHeight } : sc.getBoundingClientRect()
      const zone = 56
      const v = y < b.top + zone ? -(b.top + zone - y) / 3 : y > b.bottom - zone ? (y - (b.bottom - zone)) / 3 : 0
      if (v) { sc.scrollBy(0, Math.max(-20, Math.min(20, v))); calc() }
      raf = requestAnimationFrame(tick)
    }
    const move = (ev: PointerEvent) => { y = ev.clientY; calc() }
    const end = () => {
      cancelAnimationFrame(raf)
      handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', end)
      removeEventListener('keydown', key)
      document.body.style.userSelect = document.body.style.cursor = ''
      try { handle.releasePointerCapture(e.pointerId) } catch { /* déjà relâché */ }
      setDrag(null)
    }
    const up = () => { end(); if (pos !== idx) onDrop(id, pos) }
    const key = (ev: KeyboardEvent) => { if (ev.key === 'Escape') end() }
    handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', end)
    addEventListener('keydown', key)
    document.body.style.userSelect = 'none'; document.body.style.cursor = 'grabbing'
    calc(); raf = requestAnimationFrame(tick)
  }
  return { list, drag, start }
}
