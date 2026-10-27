import type { TemplateDef } from './types'

/**
 * Registre. Ajouter un template = un fichier `src/templates/<id>.tsx` (qui exporte `Component`) + une entrée ici.
 * Le composant est chargé à la demande : react-pdf n'entre pas dans le premier chargement.
 */
export const templates: TemplateDef[] = [
  {
    id: 'classique',
    name: { fr: 'Classique', en: 'Classic', es: 'Clásico', de: 'Klassisch', it: 'Classico', pt: 'Clássico', ar: 'كلاسيكي' },
    load: () => import('./classique'),
  },
]

export const getTemplate = (id: string) => templates.find((t) => t.id === id) ?? templates[0]
