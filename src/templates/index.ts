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
  {
    id: 'moderne',
    name: { fr: 'Moderne', en: 'Modern', es: 'Moderno', de: 'Modern', it: 'Moderno', pt: 'Moderno', ar: 'عصري' },
    load: () => import('./moderne'),
  },
  {
    id: 'minimal',
    name: { fr: 'Minimal', en: 'Minimal', es: 'Minimalista', de: 'Minimal', it: 'Minimale', pt: 'Minimalista', ar: 'بسيط' },
    load: () => import('./minimal'),
  },
  {
    id: 'creatif',
    name: { fr: 'Créatif', en: 'Creative', es: 'Creativo', de: 'Kreativ', it: 'Creativo', pt: 'Criativo', ar: 'إبداعي' },
    load: () => import('./creatif'),
  },
]

export const getTemplate = (id: string) => templates.find((t) => t.id === id) ?? templates[0]
