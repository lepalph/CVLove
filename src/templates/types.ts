import type { ComponentType } from 'react'
import type { CVLabels } from '../i18n/labels'
import type { CV, Lang } from '../model/types'

/**
 * Contrat d'un template : il ne reçoit que le CV et les libellés de sa langue.
 * Le module du template exporte `Component`, qui rend un <Document> react-pdf (A4) ; voir `classique.tsx`.
 * Helpers à réutiliser : visibleSections / visibleFields / fullName (model/cv),
 * sectionTitle (i18n/labels), formatPeriod / formatDay / isRtl (model/dates),
 * `fontFor` et `bodyStyle` (pdf/fonts) pour la police selon la langue et le RTL.
 */
export interface TemplateProps {
  cv: CV
  labels: CVLabels
}

/** Entrée du registre : métadonnées légères (galerie, formulaire) + chargement différé du composant react-pdf. */
export interface TemplateDef {
  id: string
  /** Nom affiché dans la galerie, par langue d'interface. */
  name: Record<Lang, string>
  /** `() => import('./<id>')` ; le module exporte `Component` (TemplateProps -> <Document>). */
  load: () => Promise<{ Component: ComponentType<TemplateProps> }>
}

/** 5 couleurs d'accent proposées, communes à tous les templates. */
export const ACCENTS = ['#c2410c', '#1d4ed8', '#047857', '#7c3aed', '#374151'] as const
