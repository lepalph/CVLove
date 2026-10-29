import { describe, expect, it } from 'vitest'
import { fullName } from './cv'
import { formatMonth, formatPeriod, monthNames } from './dates'
import { SAMPLE_PROFILES, sampleCV } from './sample'
import { sanitizeCV } from './sanitize'
import { LANGS } from './types'

describe('profils d’exemple', () => {
  it('3 profils x 7 langues : nom, sections et dates AAAA-MM, sans date de naissance', () => {
    for (const p of SAMPLE_PROFILES) for (const l of LANGS) {
      const cv = sampleCV(l, p)
      expect(fullName(cv), `${p}/${l}`).not.toBe('')
      expect(cv.sections.some((s) => s.kind === 'experience')).toBe(true)
      expect(cv.personal.fields.some((f) => f.kind === 'birthDate')).toBe(false)
      for (const s of cv.sections) for (const i of s.items) for (const d of [i.start, i.end]) expect(d).toMatch(/^(\d{4}-\d{2})?$/)
      expect(sanitizeCV(cv)).toEqual(cv)
    }
  })
  it('le défaut est « Vente et accueil » ; dev garde Camille', () => {
    expect(fullName(sampleCV('fr'))).toBe('Nadia Perrin')
    expect(fullName(sampleCV('fr', 'dev'))).toBe('Camille Marchand')
    expect(fullName(sampleCV('fr', 'first'))).toBe('Lucas Moreau')
  })
  it('le premier emploi a une section Bénévolat', () => {
    expect(sampleCV('fr', 'first').sections.find((s) => s.kind === 'custom')?.title).toBe('Bénévolat')
  })
})

describe('dates en listes Mois / Année', () => {
  it('l’année seule s’affiche telle quelle', () => {
    expect(formatMonth('2019', 'fr')).toBe('2019')
    expect(formatPeriod({ start: '2019', end: '2021-03', current: false }, 'fr', 'Présent')).toMatch(/^2019 – .*2021$/)
    expect(formatMonth('19', 'fr')).toBe('')
  })
  it('12 mois localisés', () => {
    expect(monthNames('fr')[2]).toBe('mars')
    expect(monthNames('en')[0]).toBe('January')
    expect(monthNames('de')).toHaveLength(12)
  })
})
