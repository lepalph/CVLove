import { describe, expect, it } from 'vitest'
import { letterLabels } from '../i18n/letter'
import { getLetterLayout, letterLayouts } from '../templates/letterTemplates'
import { patchField } from './cv'
import { exportDocs, parseImport } from './documents'
import { blankLetter, letterDesignFrom, letterFileName, letterFromCV, newLetterDoc, normalizeLetter, paragraphs, patchSender, setLetterLang } from './letter'
import { sampleCV } from './sample'
import { LANGS } from './types'

describe('lettre : création depuis un CV', () => {
  it('reprend nom, titre, e-mail, téléphone et lieu du CV ; formules de la langue', () => {
    const cv = sampleCV('fr')
    const l = letterFromCV(cv)
    expect(l.lang).toBe('fr')
    expect(l.sender).toMatchObject({ name: 'Camille Marchand', title: 'Développeuse web full-stack', email: 'camille.marchand@exemple.fr', address: 'Lyon, France' })
    expect(l.sender.phone).toContain('+33')
    expect(l.signature).toBe('Camille Marchand')
    expect(l.salutation).toBe(letterLabels.fr.salutation)
    expect(l.closing).toBe(letterLabels.fr.closing)
  })

  it('ignore les champs masqués ou vides', () => {
    const cv = sampleCV('en')
    const email = cv.personal.fields.find((f) => f.kind === 'email')!
    expect(letterFromCV(patchField(cv, email.id, { visible: false })).sender.email).toBe('')
  })

  it('est indépendante du CV après création (dans les deux sens)', () => {
    const cv = sampleCV('fr')
    const l = letterFromCV(cv)
    const before = structuredClone(cv)
    const l2 = patchSender(l, { name: 'Autre', email: 'x@y.z' })
    expect(cv).toEqual(before) // modifier la lettre ne touche pas le CV
    cv.personal.firstName = 'Zoé'
    expect(l.sender.name).toBe('Camille Marchand') // modifier le CV ne touche pas la lettre
    expect(l2.sender.email).toBe('x@y.z')
  })

  it('la signature suit le nom tant qu’on ne l’a pas modifiée', () => {
    const l = letterFromCV(sampleCV('fr'))
    expect(patchSender(l, { name: 'Zoé Durand' }).signature).toBe('Zoé Durand')
    expect(patchSender({ ...l, signature: 'Zoé' }, { name: 'Zoé Durand' }).signature).toBe('Zoé')
  })

  it('design repris du CV (accent, polices, marges, format), mise en page selon la catégorie', () => {
    const d = { ...newLetterDoc('L', blankLetter('fr')).design, accent: '#0e7490', fontPair: 'playfair' as const, pageSize: 'LETTER' as const }
    expect(letterDesignFrom(d, 'moderne')).toMatchObject({ accent: '#0e7490', fontPair: 'playfair', pageSize: 'LETTER', templateId: 'lettre-bandeau' })
    expect(letterDesignFrom(d, 'creatif').templateId).toBe('lettre-lateral')
    expect(letterDesignFrom(d, 'simple').templateId).toBe('lettre-classique')
    for (const c of ['classique', 'moderne', 'creatif', 'simple']) expect(letterLayouts.map((x) => x.id)).toContain(letterDesignFrom(d, c).templateId)
  })
})

describe('lettre : langue, texte, fichier', () => {
  it('changer de langue remplace les formules par défaut, pas celles modifiées', () => {
    const l = setLetterLang(blankLetter('fr'), 'de')
    expect(l.salutation).toBe(letterLabels.de.salutation)
    expect(l.closing).toBe(letterLabels.de.closing)
    const custom = setLetterLang({ ...blankLetter('fr'), salutation: 'Bonjour Anne,' }, 'en')
    expect(custom.salutation).toBe('Bonjour Anne,')
    expect(custom.closing).toBe(letterLabels.en.closing)
  })

  it('7 langues : libellés et formules non vides', () => {
    for (const lang of LANGS) expect(Object.values(letterLabels[lang]).every((x) => x.trim())).toBe(true)
  })

  it('paragraphes séparés par une ligne vide', () => {
    expect(paragraphs('Un\nsuite\n\n\n  Deux  \n\n')).toEqual(['Un\nsuite', 'Deux'])
  })

  it('nom de fichier Lettre-Prenom-Nom.pdf', () => {
    expect(letterFileName(letterFromCV(sampleCV('fr')))).toBe('Lettre-Camille-Marchand.pdf')
    expect(letterFileName(blankLetter('fr'))).toBe('Lettre-CVLove.pdf')
  })

  it('mise en page inconnue : repli sur la première', () => {
    expect(getLetterLayout('nimporte-quoi').id).toBe(letterLayouts[0].id)
    expect(letterLayouts).toHaveLength(3)
  })
})

describe('lettre : export / import et migration', () => {
  it('aller-retour JSON sans perte', () => {
    const doc = newLetterDoc('Lettre 2', { ...letterFromCV(sampleCV('fr')), body: 'Bonjour\n\nMerci' })
    const [back] = parseImport(exportDocs([doc]))
    expect(back.kind).toBe('letter')
    expect(back.data).toEqual(doc.data)
  })

  it('une lettre ancienne ou partielle est complétée à l’import', () => {
    const json = JSON.stringify({ documents: [{ id: 'x', kind: 'letter', name: 'Vieille', updatedAt: 1, design: {}, data: { lang: 'en', subject: 'Hi', sender: { name: 'Zoé' } } }] })
    const [doc] = parseImport(json)
    expect(doc.data).toMatchObject({ lang: 'en', subject: 'Hi', sender: { name: 'Zoé', email: '' }, recipient: { name: '' }, closing: letterLabels.en.closing })
    expect(normalizeLetter({ lang: 'xx' as never }).lang).toBe('fr')
  })
})
