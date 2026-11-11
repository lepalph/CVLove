import { describe, expect, it } from 'vitest'
import { LANGS } from '../model/types'
import { sectionsText, sectionSummary } from './sections'

describe('sections : libellés et résumé', () => {
  it('résume une section repliée', () => {
    const it3 = ['Vendeuse', 'Caissière', 'Hôtesse', 'Chef'].map((title) => ({ title, text: '' }))
    expect(sectionSummary({ kind: 'experience', items: it3.slice(0, 3) }, 'fr')).toBe('3 expériences · Vendeuse, Caissière, Hôtesse')
    expect(sectionSummary({ kind: 'experience', items: it3 }, 'fr')).toBe('4 expériences · Vendeuse, Caissière, Hôtesse…')
    expect(sectionSummary({ kind: 'skills', items: [] }, 'fr')).toBe('Vide')
    expect(sectionSummary({ kind: 'profile', items: [{ title: '', text: ' Bonjour ' }] }, 'fr')).toBe('Bonjour')
  })
  it('7 langues complètes', () => {
    for (const l of LANGS) {
      const x = sectionsText[l]
      expect(x.moved).toContain('{x}'); expect(x.moved).toContain('{n}'); expect(x.moved).toContain('{total}')
      for (const n of Object.values(x.nouns)) expect(n.split('|')).toHaveLength(2)
    }
  })
})
