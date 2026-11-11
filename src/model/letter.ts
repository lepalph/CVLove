import { letterLabels } from '../i18n/letter'
import { DEFAULT_DESIGN, fullName, slug, uid } from './cv'
import type { CV, Design, Lang, Letter, LetterDoc } from './types'

const today = () => new Date().toISOString().slice(0, 10)

/** Lettre vierge : formules par défaut de la langue (modifiables), date du jour. */
export function blankLetter(lang: Lang): Letter {
  const l = letterLabels[lang]
  return {
    lang,
    sender: { name: '', title: '', email: '', phone: '', address: '' },
    recipient: { name: '', company: '', address: '' },
    place: '', date: today(), subject: '', salutation: l.salutation, body: '', closing: l.closing, signature: '',
  }
}

/** Complète une lettre importée ou ancienne : champs manquants -> valeurs par défaut de sa langue. */
export function normalizeLetter(d: Partial<Letter> | undefined): Letter {
  const b = blankLetter(d?.lang && d.lang in letterLabels ? d.lang : 'fr')
  return { ...b, ...d, lang: b.lang, sender: { ...b.sender, ...d?.sender }, recipient: { ...b.recipient, ...d?.recipient } }
}

/** Ville d'une adresse : « Lyon, France » -> « Lyon » ; « 12 rue X, 69001 Lyon » -> « Lyon » (vide si rien de tel). */
export function cityOf(location: string): string {
  for (const seg of location.split(',').map((x) => x.trim())) {
    const m = /^\d{4,6}\s+(.+)$/.exec(seg)
    if (m) return m[1]
    if (seg && !/^\d/.test(seg)) return seg
  }
  return ''
}

/** Expéditeur repris du CV : nom, titre, premier e-mail / téléphone / lieu visibles. Copie de chaînes : aucun lien avec le CV ensuite. */
export function letterFromCV(cv: CV): Letter {
  const field = (kind: string) => cv.personal.fields.find((f) => f.kind === kind && f.visible && f.value.trim())?.value.trim() ?? ''
  const name = fullName(cv)
  return {
    ...blankLetter(cv.lang),
    sender: { name, title: cv.personal.title, email: field('email'), phone: field('phone'), address: field('location') },
    place: cityOf(field('location')),
    signature: name,
  }
}

/** Langue de la lettre : les formules qui sont encore celles par défaut de l'ancienne langue passent à celles de la nouvelle. */
export function setLetterLang(l: Letter, lang: Lang): Letter {
  const old = letterLabels[l.lang]
  const next = letterLabels[lang]
  return {
    ...l, lang,
    salutation: !l.salutation.trim() || l.salutation === old.salutation ? next.salutation : l.salutation,
    closing: !l.closing.trim() || l.closing === old.closing ? next.closing : l.closing,
  }
}

/** Modifie l'expéditeur ; la signature suit le nom tant qu'elle lui est identique. */
export function patchSender(l: Letter, patch: Partial<Letter['sender']>): Letter {
  const follow = 'name' in patch && (l.signature === l.sender.name || !l.signature.trim())
  return { ...l, sender: { ...l.sender, ...patch }, signature: follow ? patch.name ?? '' : l.signature }
}

export const patchRecipient = (l: Letter, patch: Partial<Letter['recipient']>): Letter => ({ ...l, recipient: { ...l.recipient, ...patch } })

/** Paragraphes du corps : séparés par une ligne vide. */
export const paragraphs = (body: string) => body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

export const letterFileName = (l: Letter) => {
  return `Lettre-${slug(l.sender.name) || 'CVLove'}.pdf`
}

/** Mise en page de lettre assortie à un modèle de CV : par catégorie (moderne -> bandeau, créatif -> latéral, sinon classique). */
export const letterLayoutFor = (category: string) =>
  category === 'moderne' ? 'lettre-bandeau' : category === 'creatif' ? 'lettre-lateral' : 'lettre-classique'

/** Design repris du CV (accent, paire de polices, taille, interligne, marges, format) ; seule la mise en page de lettre change. */
export const letterDesignFrom = (cvDesign: Design, category: string): Design => ({ ...cvDesign, templateId: letterLayoutFor(category) })

export const newLetterDoc = (name: string, data: Letter, design: Design = { ...DEFAULT_DESIGN, templateId: 'lettre-classique' }): LetterDoc => ({
  id: uid(), kind: 'letter', name, updatedAt: Date.now(), design, data, editorMode: 'guided',
})

/** Rien d'écrit dans la lettre (même test que l'aperçu vide de l'éditeur). */
export const isEmptyLetter = (l: Letter) => ![l.sender.name, l.recipient.name, l.recipient.company, l.subject, l.body].some((v) => v.trim())

/** Rien de saisi, formules encore celles par défaut de sa langue (la date du jour ne compte pas). */
export const isBlankLetter = (l: Letter) => {
  const d = letterLabels[l.lang]
  return isEmptyLetter(l) && !l.place.trim() && !l.signature.trim() && !l.sender.title.trim() && !l.sender.email.trim() && !l.sender.phone.trim() && !l.sender.address.trim() && !l.recipient.address.trim()
    && (!l.salutation.trim() || l.salutation === d.salutation) && (!l.closing.trim() || l.closing === d.closing)
}

/** Une lettre vierge prend la langue de l'interface (comme le CV vierge) ; une lettre commencée garde la sienne. */
export const alignBlankLetter = (l: Letter, lang: Lang): Letter => (l.lang !== lang && isBlankLetter(l) ? setLetterLang(l, lang) : l)
