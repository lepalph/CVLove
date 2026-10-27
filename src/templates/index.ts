import { buildTemplates } from './registry'
import type { LayoutMeta, LayoutModule } from './types'

/**
 * Registre automatique : tout fichier `layouts/*.tsx` qui exporte `meta` et `Component` est un modèle de plus (voir types.ts).
 * `meta` est importé seul via `?meta` (plugin vite-layout-meta, léger) ; le composant react-pdf n'est chargé qu'au premier rendu.
 */
export const templates = buildTemplates(
  import.meta.glob<LayoutMeta>('./layouts/*.tsx', { eager: true, import: 'meta', query: '?meta' }),
  import.meta.glob<LayoutModule>('./layouts/*.tsx'),
)

/** Mises en page (premier modèle de chacune) : pour les listes courtes. */
export const layouts = templates.filter((t) => t.id.endsWith('-1'))

export const getTemplate = (id: string) => templates.find((t) => t.id === id) ?? templates[0]
