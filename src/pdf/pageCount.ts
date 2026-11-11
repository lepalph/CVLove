import { useSyncExternalStore } from 'react'

// Nombre de pages de l'aperçu en cours : PdfCanvas le publie, le panneau Design le lit (sans passer par PreviewPane).
let pages = 0
const subs = new Set<() => void>()
export function setPreviewPages(n: number) {
  if (n === pages) return
  pages = n
  subs.forEach((f) => f())
}
export const usePreviewPages = () => useSyncExternalStore((f) => (subs.add(f), () => void subs.delete(f)), () => pages)
