import { Document, Page, Text, pdf } from '@react-pdf/renderer'
import { cvLabels } from '../i18n/labels'
import { letterLabels } from '../i18n/letter'
import type { CV, Design, Letter } from '../model/types'
import { getTemplate } from '../templates'
import { getLetterLayout } from '../templates/letterTemplates'
import { FAMILIES, registerFonts } from './fonts'

const fontsBase = () => `${import.meta.env?.BASE_URL ?? '/'}fonts/`
const bytesOf = async (doc: Parameters<typeof pdf>[0]) => new Uint8Array(await (await pdf(doc).toBlob()).arrayBuffer())

/**
 * fontkit garde en cache, pour toute la vie du processus, le glyphe créé la 1re fois pour un caractère, avec ses codePoints d'alors.
 * Si « â » passe avant tout « a », le « a » est créé par la décomposition (ccmp) SANS codePoints : sa table ToUnicode reste vide et
 * l'ATS lit « Form\u001dtion » dans tous les PDF suivants. On crée donc d'abord chaque glyphe de base, à partir de lettres seules.
 */
const BASE = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:;!?'’‘“”«»()[]/%&+–—…•·€@#-`
let warmed: Promise<unknown> | undefined
const warm = () =>
  (warmed ??= bytesOf(
    <Document>
      <Page>
        {FAMILIES.flatMap((f) => [400, 700].map((w) => <Text key={f + w} style={{ fontFamily: f, fontWeight: w }}>{BASE}</Text>))}
      </Page>
    </Document>,
  ))

/**
 * NFKC sur tout le contenu avant le rendu : une ligature collée depuis Word ou un PDF (« ﬁ » U+FB01) n'a pas de glyphe dans les polices
 * embarquées (« financier » devenait « nancier » dans l'aperçu, le PDF et donc l'ATS) ; NFKC la remet en lettres.
 */
const nfkc = <T,>(v: T): T =>
  typeof v === 'string' ? (v.normalize('NFKC') as T)
  : Array.isArray(v) ? (v.map(nfkc) as T)
  : v && typeof v === 'object' ? (Object.fromEntries(Object.entries(v).map(([k, x]) => [k, nfkc(x)])) as T)
  : v

/** Rend le CV en PDF (octets). Tout se passe localement ; module chargé à la demande (lazy) par l'interface. */
export async function renderPdf(cv: CV, design: Design, fontBase = fontsBase()): Promise<Uint8Array> {
  registerFonts(fontBase)
  await warm()
  cv = nfkc(cv)
  const tpl = getTemplate(design.templateId)
  const { Component } = await tpl.load()
  return bytesOf(<Component cv={cv} design={design} labels={cvLabels[cv.lang]} variant={tpl.variant} />)
}

/** Rend la lettre de motivation en PDF (octets). */
export async function renderLetterPdf(letter: Letter, design: Design, fontBase = fontsBase()): Promise<Uint8Array> {
  registerFonts(fontBase)
  await warm()
  letter = nfkc(letter)
  const { Component } = await getLetterLayout(design.templateId).load()
  return bytesOf(<Component letter={letter} design={design} labels={letterLabels[letter.lang]} />)
}
