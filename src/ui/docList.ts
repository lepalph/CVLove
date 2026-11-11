import { v2 } from '../i18n/v2'
import { fullName } from '../model/cv'
import type { Doc, Lang } from '../model/types'

/** Du plus récemment modifié au plus ancien (copie : le tableau du store n'est pas touché). */
export const byRecent = (docs: Doc[]) => [...docs].sort((a, b) => b.updatedAt - a.updatedAt)

/**
 * Nom affiché : un nom automatique (« CV », « CV 2 », « Lettre ») est traduit dans la langue de l'interface,
 * puis complété par la personne pour distinguer plusieurs documents. Un nom choisi reste tel quel.
 */
export const shownName = (d: Doc, lang: Lang) => {
  const m = /^(CV|Lettre)( \d+)?$/.exec(d.name)
  if (!m) return d.name
  const name = (m[1] === 'CV' ? v2[lang].kindCV : v2[lang].kindLetter) + (m[2] ?? '')
  const who = d.kind === 'cv' ? fullName(d.data) : d.data.sender.name.trim()
  return who ? `${name} · ${who}` : name
}
