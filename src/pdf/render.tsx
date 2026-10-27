import { pdf } from '@react-pdf/renderer'
import { cvLabels } from '../i18n/labels'
import type { CV, Design } from '../model/types'
import { getTemplate } from '../templates'
import { registerFonts } from './fonts'

/** Rend le CV en PDF (octets). Tout se passe localement ; module chargé à la demande (lazy) par l'interface. */
export async function renderPdf(cv: CV, design: Design, fontBase = `${import.meta.env?.BASE_URL ?? '/'}fonts/`): Promise<Uint8Array> {
  registerFonts(fontBase)
  const tpl = getTemplate(design.templateId)
  const { Component } = await tpl.load()
  const blob = await pdf(<Component cv={cv} design={design} labels={cvLabels[cv.lang]} variant={tpl.variant} />).toBlob()
  return new Uint8Array(await blob.arrayBuffer())
}
