import { describe, expect, it } from 'vitest'
import { emptyCV } from '../model/cv'
import { sampleCV } from '../model/sample'
import { contrast, externalCount, isEmptyCV, isExampleCV, logoAccent, shortStep } from './lib'

describe('compteur de requêtes externes', () => {
  const origin = 'http://localhost:4461'
  it('ne compte que les autres origines http(s)', () => {
    expect(externalCount([`${origin}/assets/a.js`, `${origin}/fonts/x.ttf`, 'data:image/png;base64,AAAA', 'blob:http://localhost:4461/x'], origin)).toBe(0)
    expect(externalCount([`${origin}/a.js`, 'https://fonts.googleapis.com/css', 'http://localhost:9999/x'], origin)).toBe(2)
  })
})

describe('cœur du logo', () => {
  it('prend l’accent s’il ressort sur le fond, sinon la couleur de marque', () => {
    expect(logoAccent('#1d4ed8', '#fafafa')).toBe('#1d4ed8')
    expect(logoAccent('#fff3b0', '#fafafa')).toBeUndefined() // jaune pâle sur fond clair
    expect(logoAccent('#374151', '#0a0a0a')).toBeUndefined() // ardoise sur fond sombre
    expect(logoAccent('rouge', '#fafafa')).toBeUndefined()
  })
  it('contraste WCAG : noir sur blanc = 21', () => expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0))
})

describe('barre d’étapes et état du document', () => {
  it('abrège au premier mot', () => expect(shortStep('Compétences et langues')).toBe('Compétences'))
  it('reconnaît l’exemple, le vide, et un CV rempli par la personne', () => {
    const ex = sampleCV('fr', 'dev')
    expect(isExampleCV(ex)).toBe(true)
    expect(isEmptyCV(ex)).toBe(false)
    expect(isEmptyCV(emptyCV('fr'))).toBe(true)
    const own = { ...ex, personal: { ...ex.personal, firstName: 'Zoé', lastName: 'Durand' } }
    expect(isExampleCV(own)).toBe(false)
  })
})
