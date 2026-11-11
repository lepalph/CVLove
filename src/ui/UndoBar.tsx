import { useEffect, useState } from 'react'
import { undoText } from '../i18n/undo'
import { undoDelete, useStore, useUndo } from '../store'

const DELAY = 8000
/** Champs où l'on a déjà saisi : leur Ctrl+Z natif a quelque chose à défaire. Un champ jamais saisi n'a rien à annuler, donc Ctrl+Z y annule la suppression. */
const typed = new WeakSet<EventTarget>()
addEventListener('input', (e) => e.target && typed.add(e.target), true)
const inText = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) && typed.has(t)

/** Annule la dernière suppression et rend le focus à l'élément rétabli (repéré par son data-rid). */
function undo() {
  const rid = undoDelete()
  if (!rid) return
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>(`[data-rid="${rid}"]`)
    ;(el?.matches('button, input, h3') ? el : el?.querySelector<HTMLElement>('h3, input, select, textarea'))?.focus()
  })
}

/**
 * Bandeau « Supprimé : {x} · Annuler » (8 s, un seul : une nouvelle suppression le remplace), en bas de la colonne du formulaire,
 * au-dessus du pied d'éditeur : ni l'aperçu ni la barre d'actions ne sont masqués. Ctrl/Cmd+Z l'actionne hors d'un champ de texte.
 * Région live toujours présente. `hidden` : onglet Aperçu sur mobile.
 */
export function UndoBar({ hidden }: { hidden?: boolean }) {
  const snap = useUndo((s) => s.snap)
  const t = undoText[useStore((s) => s.uiLang)]
  const n = snap?.n
  const [held, setHeld] = useState(false) // pointeur ou focus sur le bandeau : le délai attend (WCAG 2.2.1), puis repart à zéro
  useEffect(() => setHeld(false), [n])
  useEffect(() => {
    if (n === undefined || held) return
    const id = setTimeout(() => useUndo.setState({ snap: null }), DELAY)
    return () => clearTimeout(id)
  }, [n, held])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'z' || inText(e.target) || !useUndo.getState().snap) return
      e.preventDefault()
      undo()
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); useUndo.setState({ snap: null }) } // quitter l'éditeur = plus rien à annuler
  }, [])
  return (
    <div role="status" className={`pointer-events-none fixed inset-x-[var(--m)] bottom-12 z-30 flex lg:inset-x-8 lg:max-w-[28rem] ${hidden ? 'max-lg:hidden' : ''}`}>
      {snap && (
        <div key={snap.n} onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)} className="undo-in pointer-events-auto flex w-full items-center gap-2 rounded-card border border-edge bg-panel py-1 ps-4 pe-1 text-sm shadow-sheet">
          <p className="m-0 min-w-0 flex-1 truncate">{t.deleted.replace('{x}', snap.label)}</p>
          <button type="button" className="btn" onClick={undo}>{t.undo}</button>
        </div>
      )}
    </div>
  )
}
