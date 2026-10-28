import { describe, expect, it } from 'vitest'
import { contrast, ink, onAccent } from './shared'

// Lot B : l'accent libre (très clair compris) doit rester lisible dans les 12 mises en page via ink() / onAccent().
const ACCENTS = ['#fff3b0', '#facc15', '#ffffff', '#c2410c', '#1d4ed8', '#047857', '#7c3aed', '#be185d', '#0e7490', '#374151', '#000000', '#7dd3fc']

describe('contraste de l’accent', () => {
  it.each(ACCENTS)('ink(%s) : texte >= 4,5:1 sur blanc, aplat >= 7:1', (hex) => {
    expect(contrast(ink(hex), '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(contrast(ink(hex, '#ffffff', 7), '#ffffff')).toBeGreaterThanOrEqual(7)
  })
  it.each(ACCENTS)('ink(%s) sur un fond teinté', (hex) => {
    expect(contrast(ink(hex, '#f3eefc'), '#f3eefc')).toBeGreaterThanOrEqual(4.5)
  })
  it('un accent déjà assez foncé n’est pas modifié', () => {
    expect(ink('#1d4ed8')).toBe('#1d4ed8')
  })
  it.each(ACCENTS)('onAccent(%s) choisit le texte qui contraste le plus', (hex) => {
    const c = onAccent(hex)
    const other = c === '#ffffff' ? '#1f1b16' : '#ffffff'
    expect(contrast(hex, c)).toBeGreaterThanOrEqual(contrast(hex, other))
  })
})
