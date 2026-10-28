import { letterUi } from '../i18n/letter'
import { selectCvDoc, useStore } from '../store'

/** « Créer la lettre assortie » : nouvelle lettre dont l'expéditeur, l'accent et les polices viennent du CV en cours d'édition. */
export function LetterLink({ className = 'btn' }: { className?: string }) {
  const createLetter = useStore((s) => s.createLetter)
  const L = letterUi[useStore((s) => s.uiLang)]
  return (
    <button type="button" className={className} onClick={() => { createLetter(selectCvDoc(useStore.getState()).id); location.hash = '#/lettre' }}>
      {L.matching}
    </button>
  )
}
