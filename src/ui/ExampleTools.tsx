import { extra } from '../i18n/extra'
import { ui } from '../i18n/ui'
import { fullName } from '../model/cv'
import { blankCV } from '../model/documents'
import type { Letter } from '../model/types'
import { SAMPLE_PROFILES, sampleLetter, type SampleProfile } from '../model/sample'
import { useCvDoc, useLetterDoc, useStore } from '../store'
import { isEmptyCV, isExampleCV } from './lib'

/** « Tout effacer » (avec confirmation) : repart de sections vides prêtes à remplir, champs d'exemple en placeholder. Même geste dans les deux modes. */
export function useClearAll() {
  const clearAll = useStore((s) => s.clearAll)
  const update = useStore((s) => s.update)
  const t = ui[useStore((s) => s.uiLang)]
  return () => {
    if (!confirm(t.clearConfirm)) return
    clearAll()
    update((c) => (c.sections.length ? c : { ...c, sections: blankCV(c.lang).sections }))
  }
}

/** Au-dessus du formulaire, dans les deux modes : prévient quand le contenu est l'exemple, propose de le charger quand le document est vide. Jamais d'effet sur un document rempli. */
export function ExampleTools() {
  const cv = useCvDoc().data
  const loadSample = useStore((s) => s.loadSample)
  const uiLang = useStore((s) => s.uiLang)
  const clear = useClearAll()
  const x = extra[uiLang]
  if (isExampleCV(cv)) {
    return (
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-card border border-edge bg-sunk p-4">
        <p className="m-0 flex-1 basis-56 text-pretty text-sm">{x.exampleBanner.replace('{name}', fullName(cv))}</p>
        <button type="button" className="btn" onClick={clear}>{x.startEmpty}</button>
      </div>
    )
  }
  if (isEmptyCV(cv)) {
    const t = ui[uiLang]
    return (
      <div role="group" aria-label={t.sampleIntro} className="mb-5">
        <p className="m-0 mb-2 text-sm font-medium">{t.sampleIntro}</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROFILES.map((p) => <button key={p} type="button" className="btn" onClick={() => loadSample(p)}>{t.samples[p]}</button>)}
        </div>
      </div>
    )
  }
  return null
}

const fillLetter = (l: Letter, profile: SampleProfile): Letter => {
  const s = sampleLetter(l.lang, profile)
  const keep = !!l.sender.name.trim()
  return { ...s, sender: keep ? l.sender : s.sender, signature: keep ? l.signature : s.signature, place: l.place || s.place, date: l.date, salutation: l.salutation, closing: l.closing }
}

/** Pendant de ExampleTools pour la lettre : tant que destinataire, objet et corps sont vides, propose l'exemple (l'expéditeur déjà saisi est gardé). */
export function LetterExampleTools() {
  const letter = useLetterDoc()!.data
  const update = useStore((s) => s.updateLetter)
  const uiLang = useStore((s) => s.uiLang)
  const t = ui[uiLang]
  if ([letter.recipient.name, letter.recipient.company, letter.subject, letter.body].some((v) => v.trim())) return null
  return (
    <div role="group" aria-label={t.sampleIntro} className="mb-5">
      <p className="m-0 mb-2 text-sm font-medium">{t.sampleIntro}</p>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROFILES.map((p) => <button key={p} type="button" className="btn" onClick={() => update((l) => fillLetter(l, p))}>{t.samples[p]}</button>)}
      </div>
    </div>
  )
}
