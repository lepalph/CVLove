import type { Lang } from '../model/types'

/** Textes de la barre de pages de l'aperçu : page précédente/suivante, et avertissement quand l'aperçu est tronqué. */
export interface PagesText {
  prev: string
  next: string
  /** `{shown}` = pages affichées, `{total}` = pages du document. */
  limited: string
}

export const pagesText: Record<Lang, PagesText> = {
  fr: { prev: 'Page précédente', next: 'Page suivante', limited: 'Aperçu limité aux {shown} premières pages sur {total}. Le PDF téléchargé contient tout.' },
  en: { prev: 'Previous page', next: 'Next page', limited: 'Preview limited to the first {shown} of {total} pages. The downloaded PDF has them all.' },
  de: { prev: 'Vorherige Seite', next: 'Nächste Seite', limited: 'Vorschau auf die ersten {shown} von {total} Seiten begrenzt. Das heruntergeladene PDF enthält alle.' },
  es: { prev: 'Página anterior', next: 'Página siguiente', limited: 'Vista previa limitada a las primeras {shown} de {total} páginas. El PDF descargado las incluye todas.' },
  it: { prev: 'Pagina precedente', next: 'Pagina successiva', limited: 'Anteprima limitata alle prime {shown} pagine su {total}. Il PDF scaricato le contiene tutte.' },
  pt: { prev: 'Página anterior', next: 'Página seguinte', limited: 'Pré-visualização limitada às primeiras {shown} de {total} páginas. O PDF descarregado inclui todas.' },
  ar: { prev: 'الصفحة السابقة', next: 'الصفحة التالية', limited: 'المعاينة محدودة بأول {shown} صفحة من {total}. ملف PDF الذي تنزّله يتضمّن كل الصفحات.' },
}
