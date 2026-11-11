import type { Lang } from '../model/types'

/** Filtres du catalogue repliés dans l'éditeur : nom du bouton, et décompte `{n}` modèles affichés sur `{total}`. */
export const filtersText: Record<Lang, { filters: string; count: string }> = {
  fr: { filters: 'Filtres', count: '{n} sur {total} modèles' },
  en: { filters: 'Filters', count: '{n} of {total} templates' },
  de: { filters: 'Filter', count: '{n} von {total} Vorlagen' },
  es: { filters: 'Filtros', count: '{n} de {total} plantillas' },
  it: { filters: 'Filtri', count: '{n} di {total} modelli' },
  pt: { filters: 'Filtros', count: '{n} de {total} modelos' },
  ar: { filters: 'عوامل التصفية', count: '{n} من {total} نموذجًا' },
}
