import type { LetterMeta, LetterModule } from './types'

/** Registre automatique des lettres : tout fichier `letters/*.tsx` qui exporte `meta` et `Component` (voir types.ts). Même mécanique que `index.ts`. */
const metas = import.meta.glob<LetterMeta>('./letters/*.tsx', { eager: true, import: 'meta', query: '?meta' })
const loaders = import.meta.glob<LetterModule>('./letters/*.tsx')

export const letterLayouts = Object.entries(metas)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([path, meta]) => ({ ...meta, load: loaders[path] }))

export const getLetterLayout = (id: string) => letterLayouts.find((l) => l.id === id) ?? letterLayouts[0]
