import type { CV, Design, Letter } from '../model/types'

/** react-pdf et les templates sont chargés au premier besoin, pas dans le bundle initial. */
export const renderLazy = (cv: CV, design: Design) => import('./render').then((m) => m.renderPdf(cv, design))
export const renderLetterLazy = (letter: Letter, design: Design) => import('./render').then((m) => m.renderLetterPdf(letter, design))
