import { describe, expect, it } from 'vitest'
import { LANGS } from '../model/types'
import { undoText } from './undo'

describe('annuler : libellés', () => {
  it('7 langues, avec {x} dans l’annonce', () => {
    for (const l of LANGS) {
      expect(undoText[l].deleted).toContain('{x}')
      expect(undoText[l].undo.length).toBeGreaterThan(1)
    }
  })
})
