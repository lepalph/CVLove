import type { CV } from '../model/types'

/** react-pdf et les templates sont chargés au premier besoin, pas dans le bundle initial. */
export const renderLazy = (cv: CV) => import('./render').then((m) => m.renderPdf(cv))
