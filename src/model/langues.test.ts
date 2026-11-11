import { describe, expect, it } from 'vitest'
import { sanitizeCV } from './sanitize'
import { CEFR, LANGS, cefrFromLevel } from './types'
import { cefrNames } from '../i18n/cefr'

const langs = (items: unknown[]) => sanitizeCV({ sections: [{ kind: 'languages', items }] }).sections[0].items

describe('niveaux de langue (CECRL)', () => {
  it('ancien niveau 1 à 5 migré vers un niveau CECRL, sans perdre le texte libre', () => {
    const out = langs([{ title: 'Anglais', text: 'Courant', level: 4 }, { title: 'Latin', level: 1 }])
    expect(out[0]).toMatchObject({ cefr: 'C1', text: 'Courant' })
    expect(out[0].level).toBeUndefined()
    expect(out[1]).toMatchObject({ cefr: 'A1' })
  })
  it('un niveau CECRL valide est gardé, un invalide écarté', () => {
    expect(langs([{ cefr: 'native' }, { cefr: 'B2', level: 2 }, { cefr: 'Z9' }]).map((i) => i.cefr)).toEqual(['native', 'B2', undefined])
  })
  it('idempotent', () => {
    const once = sanitizeCV({ sections: [{ kind: 'languages', items: [{ level: 3 }] }] })
    expect(sanitizeCV(once)).toEqual(once)
  })
  it('les compétences gardent le niveau 1 à 5', () => {
    const it = sanitizeCV({ sections: [{ kind: 'skills', items: [{ level: 4 }] }] }).sections[0].items[0]
    expect(it.level).toBe(4)
    expect(it.cefr).toBeUndefined()
  })
  it('chaque niveau a un nom dans les 7 langues', () => {
    for (const l of LANGS) for (const c of CEFR) expect(cefrNames[l][c]).toBeTruthy()
    expect(cefrFromLevel(5)).toBe('C2')
  })
})
