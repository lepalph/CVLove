import type { CV, Doc } from './types'

/** CV juste avant la dernière suppression (au plus une, pas d'historique) et `rid`, l'id de l'élément supprimé ('photo' pour la photo). */
export interface Snap { docId: string; data: CV; rid: string }

/** Remet `id` (pris dans `before`) dans `now`, juste après sa voisine précédente encore présente ; null s'il est déjà là ou absent de `before`. */
function reinsert<T extends { id: string }>(before: T[], now: T[], id: string): T[] | null {
  const i = before.findIndex((x) => x.id === id)
  if (i < 0 || now.some((x) => x.id === id)) return null
  const prev = before.slice(0, i).reverse().find((p) => now.some((x) => x.id === p.id))
  const at = prev ? now.findIndex((x) => x.id === prev.id) + 1 : 0
  return [...now.slice(0, at), before[i], ...now.slice(at)]
}

/** Remet dans `now` le seul élément supprimé (section, entrée, champ ou photo) : ce qui a été saisi depuis est gardé. null s'il n'y a rien à rétablir. */
function restoreIn(before: CV, now: CV, rid: string): CV | null {
  if (rid === 'photo') return before.personal.photo && !now.personal.photo ? { ...now, personal: { ...now.personal, photo: before.personal.photo } } : null
  const fields = reinsert(before.personal.fields, now.personal.fields, rid)
  if (fields) return { ...now, personal: { ...now.personal, fields } }
  const sections = reinsert(before.sections, now.sections, rid)
  if (sections) return { ...now, sections }
  const from = before.sections.find((s) => s.items.some((x) => x.id === rid))
  const into = from && now.sections.find((s) => s.id === from.id)
  const items = into && reinsert(from.items, into.items, rid)
  return items ? { ...now, sections: now.sections.map((s) => (s === into ? { ...s, items } : s)) } : null
}

/** Rétablit l'élément supprimé dans le CV actif ; null (rien à faire) si ce CV n'existe plus, n'est plus actif, ou si l'élément n'a plus où aller. Le design reste tel quel. */
export function restoreSnap(documents: Doc[], activeId: string, snap: Snap): Doc[] | null {
  const d = documents.find((x) => x.id === snap.docId)
  if (!d || d.kind !== 'cv' || activeId !== snap.docId) return null
  const data = restoreIn(snap.data, d.data, snap.rid)
  return data && documents.map((x) => (x === d ? { ...d, data, updatedAt: Date.now() } : x))
}
