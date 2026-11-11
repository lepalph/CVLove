import { describe, expect, it } from 'vitest'
import { letterLabels } from '../i18n/letter'
import { alignBlankLetter, blankLetter, isBlankLetter } from './letter'

describe('lettre vierge : suit la langue de l’interface', () => {
  it('une lettre vierge change de langue et de formules', () => {
    const l = alignBlankLetter(blankLetter('fr'), 'en')
    expect(l.lang).toBe('en')
    expect(l.salutation).toBe(letterLabels.en.salutation)
    expect(l.closing).toBe(letterLabels.en.closing)
  })

  it('une lettre commencée garde sa langue (un champ rempli suffit)', () => {
    for (const patch of [{ subject: 'Candidature' }, { place: 'Lyon' }, { salutation: 'Bonjour Anne,' }, { signature: 'Zoé' }]) {
      const l = { ...blankLetter('fr'), ...patch }
      expect(isBlankLetter(l)).toBe(false)
      expect(alignBlankLetter(l, 'en')).toBe(l)
    }
  })

  it('déjà dans la bonne langue : même objet', () => {
    const l = blankLetter('de')
    expect(alignBlankLetter(l, 'de')).toBe(l)
  })
})
