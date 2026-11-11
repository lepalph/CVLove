import { describe, expect, it } from 'vitest'
import { cvLabels } from '../i18n/labels'
import { DEFAULT_DESIGN } from '../model/cv'
import { cleanDesign } from '../model/sanitize'
import { makeTheme } from './theme'

const theme = (over = {}) => makeTheme({ lang: 'fr' }, { ...DEFAULT_DESIGN, ...over }, cvLabels.fr)

describe('Tenir sur 1 page', () => {
  it("sans l'option, le thème est inchangé", () => {
    const t = theme()
    expect(t.s(10)).toBe(10)
    expect(t.m(10)).toBe(10)
    expect(t.pageStyle(10, 10).lineHeight).toBe(1.4)
  })
  it("avec l'option : texte à 0,9, marges et interligne resserrés, jamais sous 8 pt", () => {
    const t = theme({ fitPage: true })
    expect(t.s(10)).toBe(9)
    expect(t.s(9)).toBe(8.1)
    expect(t.s(8.5)).toBe(8)
    expect(t.s(7)).toBe(7) // déjà sous 8 : on ne le réduit pas
    expect(t.m(10)).toBeLessThan(10)
    expect(t.pageStyle(10, 10).lineHeight).toBeLessThan(1.4)
    expect(t.pageStyle(10, 10).lineHeight).toBeGreaterThanOrEqual(1.2)
  })
  it("un document sans le champ reste hors option, et l'import ne garde que true", () => {
    expect(cleanDesign({}).fitPage).toBeUndefined()
    expect(cleanDesign({ fitPage: 'oui' }).fitPage).toBeUndefined()
    expect(cleanDesign({ fitPage: true }).fitPage).toBe(true)
  })
})
