import { describe, expect, it } from 'vitest'
import { FONT_PAIRS, LANGS } from './types'
import { parseImport } from './documents'
import { cleanPhoto, sanitizeCV, sanitizeDoc, sanitizeState } from './sanitize'
import { sampleCV } from './sample'

const PNG = 'data:image/png;base64,iVBORw0KGgo='
const blank = () => sanitizeDoc({ kind: 'cv', data: {} })!

describe('sanitizeCV : toujours un CV rendable', () => {
  it('entrées absurdes -> CV valide', () => {
    for (const bad of [null, undefined, 42, 'x', [], { lang: 'xx', personal: 3, sections: 'y' }]) {
      const cv = sanitizeCV(bad)
      expect(LANGS).toContain(cv.lang)
      expect(Array.isArray(cv.personal.fields)).toBe(true)
      expect(cv.sections).toEqual([])
    }
  })
  it('types forcés, items null écartés, sections inconnues écartées', () => {
    const cv = sanitizeCV({
      lang: 'xx',
      personal: { firstName: 42, lastName: { a: 1 }, fields: [null, { kind: 'zz', value: 42, visible: 'oui' }] },
      sections: [{ kind: 'experience', items: [null, 3, { title: 7, level: 99, current: 'x' }] }, { kind: 'hack', items: [] }, null],
    })
    expect(cv.lang).toBe('fr')
    expect(cv.personal.firstName).toBe('')
    expect(cv.personal.fields).toEqual([expect.objectContaining({ kind: 'custom', value: '', visible: true })])
    expect(cv.sections).toHaveLength(1)
    expect(cv.sections[0].items).toEqual([expect.objectContaining({ title: '', level: 5, current: false })])
  })
  it('un CV valide ressort identique', () => {
    const cv = sampleCV('fr')
    expect(sanitizeCV(cv)).toEqual(cv)
  })
})

describe('design importé', () => {
  it('langue, police, accent, tailles : repli sur les valeurs par défaut ou bornes', () => {
    const doc = sanitizeDoc({ kind: 'cv', data: {}, design: { accent: 'url(http://evil)', fontPair: 'zz', fontScale: 99, lineHeight: -1, margins: 'x', pageSize: 'A0', templateId: 5 } })!
    expect(doc.design).toMatchObject({ accent: '#c2410c', fontScale: 1.15, lineHeight: 1.2, margins: 'normal', pageSize: 'A4', templateId: 'classique-1' })
    expect(FONT_PAIRS).toContain(doc.design.fontPair)
  })
})

describe('photo : data:image base64 uniquement', () => {
  it.each([
    ['https://evil.tld/p.gif?x'], ['http://evil.tld/p.png'], ['//evil.tld/p.png'], ['blob:http://x/1'],
    ['data:image/svg+xml;base64,PHN2Zz4='], ['data:image/svg+xml,<svg onload=alert(1)>'], ['data:text/html;base64,PGI+'],
    ['data:image/png;base64,AAAA"><script>'], [42], [null],
  ])('refuse %s', (p) => expect(cleanPhoto(p)).toBe(''))
  it('accepte jpeg, png, webp ; refuse plus de 1,5 Mo', () => {
    expect(cleanPhoto(PNG)).toBe(PNG)
    expect(cleanPhoto('data:image/jpeg;base64,/9j/AAAA')).not.toBe('')
    expect(cleanPhoto('data:image/webp;base64,UklGRg==')).not.toBe('')
    expect(cleanPhoto('data:image/png;base64,' + 'A'.repeat(1_600_000))).toBe('')
  })
})

describe('parseImport : JSON piégés', () => {
  const doc = (data: object, extra: object = {}) => JSON.stringify({ documents: [{ kind: 'cv', id: 'a', name: 'CV', data, ...extra }] })
  const cv = { lang: 'fr', personal: { firstName: 'Zoé', photo: '', fields: [] }, sections: [] }

  it('prototype pollution (__proto__, constructor) sans effet', () => {
    const evil = '{"__proto__":{"polluted":1},"documents":[{"kind":"cv","__proto__":{"polluted":2},"data":{"__proto__":{"polluted":3},"lang":"fr","personal":{"__proto__":{"polluted":4},"fields":[]},"sections":[]},"design":{"__proto__":{"polluted":5},"constructor":{"prototype":{"polluted":6}}}}]}'
    const [d] = parseImport(evil)
    expect(({} as any).polluted).toBeUndefined()
    expect(Object.keys(d)).not.toContain('__proto__')
    expect(Object.hasOwn(d.design, '__proto__')).toBe(false)
    expect(Object.hasOwn(d.data, '__proto__')).toBe(false)
  })
  it('photo https : vidée à l’import', () => {
    const [d] = parseImport(doc({ ...cv, personal: { ...cv.personal, photo: 'https://evil.tld/p.gif?x' } }))
    expect(d.kind === 'cv' && d.data.personal.photo).toBe('')
  })
  it('photo SVG : vidée', () => {
    const [d] = parseImport(doc({ ...cv, personal: { ...cv.personal, photo: 'data:image/svg+xml;base64,PHN2Zz4=' } }))
    expect(d.kind === 'cv' && d.data.personal.photo).toBe('')
  })
  it('ancien export v1 : photo vérifiée aussi', () => {
    const [d] = parseImport(JSON.stringify({ ...cv, personal: { ...cv.personal, photo: 'https://evil.tld/x' } }))
    expect(d.kind === 'cv' && d.data.personal.photo).toBe('')
  })
  it('fichier de 20 Mo refusé', () => {
    expect(() => parseImport(doc({ ...cv, personal: { ...cv.personal, lastName: 'x'.repeat(20_000_000) } }))).toThrow('invalid')
  })
  it('gros texte dans la limite : tronqué, pas de plantage', () => {
    const [d] = parseImport(doc({ ...cv, personal: { ...cv.personal, lastName: 'x'.repeat(100_000) } }))
    expect(d.kind === 'cv' && d.data.personal.lastName.length).toBe(20_000)
  })
  it('lettre aux champs mal typés -> lettre valide', () => {
    const [d] = parseImport(JSON.stringify({ documents: [{ kind: 'letter', data: { lang: 'zz', body: 5, sender: 'x', recipient: null } }] }))
    expect(d.kind === 'letter' && d.data).toMatchObject({ lang: 'fr', body: '', sender: { name: '' }, recipient: { company: '' } })
  })
  it('design hostile corrigé', () => {
    const [d] = parseImport(doc(cv, { design: { accent: 'rouge', fontPair: 'zz' } }))
    expect(d.design.accent).toBe('#c2410c')
  })
  it('sans CV valide : refus', () => {
    expect(() => parseImport('{"documents":"x"}')).toThrow('invalid')
    expect(() => parseImport('{"documents":[{"kind":"cv","data":{"personal":1}}]}')).toThrow('invalid')
  })
})

describe('sanitizeState (hydratation)', () => {
  it('état corrompu -> état utilisable avec un CV', () => {
    for (const bad of [null, 'x', { documents: 'x' }, { documents: [null, 3, { kind: 'zz' }] }]) {
      const s = sanitizeState(bad, blank)
      expect(s.documents.some((d) => d.kind === 'cv')).toBe(true)
      expect(s.documents.map((d) => d.id)).toContain(s.activeId)
    }
  })
  it('conserve les documents valides, l’actif et la langue d’interface ; ids dupliqués rendus uniques', () => {
    const a = { kind: 'cv', id: 'x', name: 'A', data: sampleCV('fr') }
    const s = sanitizeState({ documents: [a, { ...a, name: 'B' }], activeId: 'x', uiLang: 'de' }, blank)
    expect(s.documents).toHaveLength(2)
    expect(new Set(s.documents.map((d) => d.id)).size).toBe(2)
    expect(s.activeId).toBe('x')
    expect(s.uiLang).toBe('de')
    expect(sanitizeState({ documents: [a], uiLang: 'xx' }, blank).uiLang).toBeUndefined()
  })
})
