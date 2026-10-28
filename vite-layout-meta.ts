import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

/**
 * `layouts/<id>.tsx?meta` = seulement `export const meta = { ... }` de ce fichier, sans ses imports (react-pdf).
 * Ainsi le registre lit les métadonnées au démarrage sans embarquer react-pdf dans le premier chargement.
 * Convention (voir templates/types.ts) : `meta` est un littéral pur, déclaré au niveau racine, dont l'accolade fermante est seule en début de ligne.
 */
export function layoutMeta(): Plugin {
  return {
    name: 'cvlove-layout-meta',
    enforce: 'pre',
    load(id) {
      if (!/\/(layouts|letters)\/[^/]+\.tsx\?meta$/.test(id)) return
      const src = readFileSync(id.slice(0, -'?meta'.length), 'utf8')
      const m = /export const meta[^=\n]*=\s*(\{[\s\S]*?\n\})\n/.exec(src)
      if (!m) throw new Error(`${id} : pas de « export const meta = { ... } » en tête de fichier`)
      return `export const meta = ${m[1]}`
    },
  }
}
