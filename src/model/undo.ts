import type { CV, Doc } from './types'

/** Contenu du CV juste avant la dernière suppression (au plus un, pas d'historique). */
export interface Snap { docId: string; data: CV }

/** Remet le contenu d'avant la suppression ; null (rien à faire) si ce CV n'existe plus ou n'est plus le document actif. Le design reste tel quel. */
export function restoreSnap(documents: Doc[], activeId: string, snap: Snap): Doc[] | null {
  const d = documents.find((x) => x.id === snap.docId)
  if (!d || d.kind !== 'cv' || activeId !== snap.docId) return null
  return documents.map((x) => (x === d ? { ...d, data: snap.data, updatedAt: Date.now() } : x))
}
