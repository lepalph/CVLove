import { describe, expect, it } from 'vitest'
import { saved } from '../i18n/saved'
import { addSection, emptyCV, patchSection, setCollapsed, sameRendered } from '../model/cv'
import { LANGS } from '../model/types'

describe('P0 S : aperçu et repli', () => {
  const cv = addSection(addSection(emptyCV(), 'profile'), 'experience')
  it('replier une section ne change pas ce qui est rendu', () => {
    expect(sameRendered(cv, setCollapsed(cv, true))).toBe(true)
    expect(sameRendered(setCollapsed(cv, true), setCollapsed(cv, false))).toBe(true)
  })
  it('un vrai changement de contenu, de visibilité ou de rang reste détecté', () => {
    expect(sameRendered(cv, patchSection(cv, cv.sections[0].id, { visible: false }))).toBe(false)
    expect(sameRendered(cv, { ...cv, sections: [...cv.sections].reverse() })).toBe(false)
    expect(sameRendered(cv, addSection(cv, 'skills'))).toBe(false)
    expect(sameRendered(cv, { ...cv, lang: 'en' })).toBe(false)
  })
})

describe('témoin « Enregistré »', () => {
  it('7 langues, texte non vide', () => {
    for (const l of LANGS) expect(saved[l].trim().length).toBeGreaterThan(3)
  })
})
