import { pdf } from '@react-pdf/renderer'
import { cvLabels } from '../i18n/labels'
import { letterLabels } from '../i18n/letter'
import type { CV, Design, Letter } from '../model/types'
import { getTemplate } from '../templates'
import { getLetterLayout } from '../templates/letterTemplates'
import { registerFonts } from './fonts'

const fontsBase = () => `${import.meta.env?.BASE_URL ?? '/'}fonts/`
const bytesOf = async (doc: Parameters<typeof pdf>[0]) => new Uint8Array(await (await pdf(doc).toBlob()).arrayBuffer())

/** Rend le CV en PDF (octets). Tout se passe localement ; module chargé à la demande (lazy) par l'interface. */
export async function renderPdf(cv: CV, design: Design, fontBase = fontsBase()): Promise<Uint8Array> {
  registerFonts(fontBase)
  const tpl = getTemplate(design.templateId)
  const { Component } = await tpl.load()
  return bytesOf(<Component cv={cv} design={design} labels={cvLabels[cv.lang]} variant={tpl.variant} />)
}

/** Rend la lettre de motivation en PDF (octets). */
export async function renderLetterPdf(letter: Letter, design: Design, fontBase = fontsBase()): Promise<Uint8Array> {
  registerFonts(fontBase)
  const { Component } = await getLetterLayout(design.templateId).load()
  return bytesOf(<Component letter={letter} design={design} labels={letterLabels[letter.lang]} />)
}
