import { describe, expect, it } from 'vitest'
import { blankCV, newCVDoc } from '../model/documents'
import { byRecent, shownName } from './docList'

const doc = (name: string, updatedAt: number) => ({ ...newCVDoc(name, blankCV('fr')), updatedAt })

describe('liste de Mes documents', () => {
  it('trie du plus récent au plus ancien, sans toucher au tableau d’origine', () => {
    const docs = [doc('a', 1), doc('b', 3), doc('c', 2)]
    expect(byRecent(docs).map((d) => d.name)).toEqual(['b', 'c', 'a'])
    expect(docs.map((d) => d.name)).toEqual(['a', 'b', 'c'])
  })
  it('traduit « Lettre » et « Lettre 2 » dans la langue de l’interface', () => {
    const l = { ...doc('Lettre 2', 1), kind: 'letter' as const, data: { sender: { name: '' } } } as never
    expect(shownName(l, 'en')).toBe('Letter 2')
    expect(shownName(l, 'de')).toBe('Anschreiben 2')
  })
  it('un nom choisi par la personne reste tel quel', () => {
    expect(shownName(doc('Candidature', 1), 'en')).toBe('Candidature')
  })
})
