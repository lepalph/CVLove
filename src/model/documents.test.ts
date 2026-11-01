import { describe, expect, it } from 'vitest'
import { getTemplate, templates } from '../templates'
import { patchSection } from './cv'
import { blankCV, duplicateDoc, exportDocs, followName, freeName, migrateV1, newCVDoc, parseImport, untitledName } from './documents'
import { sampleCV } from './sample'

// État tel que le store v1 l'écrivait dans localStorage (`cvlove:v1`, zustand persist : { state, version: 1 }).
const v1 = {
  state: {
    uiLang: 'fr',
    cv: {
      lang: 'en',
      templateId: 'moderne',
      accent: '#1d4ed8',
      personal: {
        firstName: 'Zoé', lastName: 'Durand', title: 'Designer', photo: 'data:image/jpeg;base64,/9j/4AAQAAAAAAAAAAAAAAAAAAD/wAARCAAKAAoDAAAAAAAAAAAA', // JPEG 10×10 bien formé (en-tête seul)
        fields: [
          { id: 'f1', kind: 'email', value: 'zoe@exemple.fr', visible: true },
          { id: 'f2', kind: 'phone', value: '+33 6 00 00 00 00', visible: false },
          { id: 'f3', kind: 'custom', label: 'GitHub', value: 'zoe', visible: true },
        ],
      },
      sections: [
        { id: 's1', kind: 'experience', title: 'Mon parcours', visible: true, items: [{ id: 'i1', title: 'Poste', subtitle: 'Boîte', place: 'Lyon', start: '2020-01', end: '', current: true, text: '- un\n- deux' }] },
        { id: 's2', kind: 'skills', title: '', visible: false, items: [{ id: 'i2', title: 'Front', subtitle: '', place: '', start: '', end: '', current: false, text: 'React' }] },
      ],
    },
  },
  version: 1,
}

describe('migration v1 -> v2', () => {
  it('le CV v1 devient le premier document, sans perte', () => {
    const m = migrateV1(v1.state as never)
    expect(m.documents).toHaveLength(1)
    const [doc] = m.documents
    expect(m.activeId).toBe(doc.id)
    expect(doc.kind).toBe('cv')
    const { templateId, accent, ...content } = v1.state.cv
    expect(doc.kind === 'cv' && doc.data).toEqual(content) // contenu identique : photo, champs masqués, titres perso, items
    expect(doc.design.templateId).toBe(`${templateId}-1`)
    expect(doc.design.accent).toBe(accent)
    expect(doc.design.pageSize).toBe('A4')
    expect(m.uiLang).toBe('fr')
    expect(templates.map((t) => t.id)).toContain(doc.design.templateId) // le modèle existe dans le registre
  })

  it('mode d’édition : guidé pour un nouveau document, complet pour un document migré', () => {
    expect(newCVDoc('CV', sampleCV('fr', 'dev')).editorMode).toBe('guided')
    expect(migrateV1(v1.state as never).documents[0].editorMode).toBe('full')
  })

  it('un état v1 illisible donne un CV vierge plutôt qu’une erreur', () => {
    expect(migrateV1({} as never).documents).toHaveLength(1)
  })
})

describe('documents', () => {
  it('duplique en copie indépendante', () => {
    const a = newCVDoc('CV', sampleCV('fr', 'dev'))
    const b = duplicateDoc(a, 'CV 2')
    expect(b.id).not.toBe(a.id)
    expect(b.data).toEqual(a.data)
    if (b.kind === 'cv') b.data = patchSection(b.data, b.data.sections[0].id, { title: 'X' })
    expect(a.kind === 'cv' && a.data.sections[0].title).toBe('')
  })

  it('exporte puis réimporte (nouveaux ids, contenu et design identiques)', () => {
    const a = newCVDoc('Mon CV', sampleCV('fr', 'dev'))
    const [b] = parseImport(exportDocs([a]))
    expect(b.id).not.toBe(a.id)
    expect({ ...b, id: '', updatedAt: 0 }).toEqual({ ...a, id: '', updatedAt: 0 })
  })

  it('importe aussi un ancien export v1 (CV nu)', () => {
    const [d] = parseImport(JSON.stringify(v1.state.cv))
    expect(d.design.templateId).toBe('moderne-1')
    expect(d.design.accent).toBe('#1d4ed8')
    expect(d.kind === 'cv' && (d.data as unknown as Record<string, unknown>).templateId).toBeUndefined()
  })

  it('refuse un fichier qui n’est pas un export', () => {
    expect(() => parseImport('{"a":1}')).toThrow()
    expect(() => parseImport('pas du json')).toThrow()
  })

  it('choisit un nom libre', () => {
    const docs = [newCVDoc('CV', sampleCV('fr', 'dev')), newCVDoc('CV 2', sampleCV('fr', 'dev'))]
    expect(freeName(docs, 'CV')).toBe('CV 3')
    expect(freeName(docs, 'Lettre')).toBe('Lettre')
  })
})

describe('registre des modèles', () => {
  it('construit mise en page x 3 styles, id = <mise en page>-<n>', () => {
    expect(templates.length).toBeGreaterThanOrEqual(12)
    expect(templates.length % 3).toBe(0)
    for (const t of templates) expect(t.id).toMatch(/^[a-z-]+-[123]$/)
    expect(new Set(templates.map((t) => t.id)).size).toBe(templates.length)
  })
  it('retombe sur le premier modèle si l’id est inconnu', () => {
    expect(getTemplate('inconnu')).toBe(templates[0])
  })
})

describe('nom automatique d’un CV', () => {
  it('suit le nom de la personne tant qu’il est automatique, puis plus', () => {
    const d = newCVDoc(untitledName('fr'), blankCV('fr'))
    const next = { ...d.data, personal: { ...d.data.personal, firstName: 'Zoé' } }
    expect(followName(d, next, 'fr')).toBe('Zoé')
    expect(followName({ ...d, name: 'Candidature' }, next, 'fr')).toBe('Candidature')
    expect(followName({ ...d, name: 'CV sans titre 2' }, next, 'fr')).toBe('Zoé')
    expect(followName({ ...d, name: 'Zoé', data: next }, d.data, 'en')).toBe('Untitled CV')
  })
})
