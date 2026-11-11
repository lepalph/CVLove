import { describe, expect, it } from 'vitest'
import { DEFAULT_DESIGN, patchField, patchItem, patchSection, removeField, removeItem, removeSection } from './cv'
import { sampleCV } from './sample'
import { newCVDoc } from './documents'
import { restoreSnap } from './undo'

const doc = newCVDoc('CV', sampleCV('fr'), DEFAULT_DESIGN)
const cvOf = (out: ReturnType<typeof restoreSnap>) => { const d = out![0]; if (d.kind !== 'cv') throw new Error('pas un CV'); return d.data }

describe('annuler une suppression : restoreSnap', () => {
  it('rétablit la section à la même place, sans toucher au design', () => {
    const before = doc.data
    const id = before.sections[1].id
    const after = { ...doc, data: removeSection(before, id), design: { ...doc.design, accent: '#123456' } }
    const out = restoreSnap([after], doc.id, { docId: doc.id, data: before, rid: id })!
    expect(cvOf(out)).toEqual(before)
    expect(out[0].design.accent).toBe('#123456')
    expect(out[0].updatedAt).toBeGreaterThanOrEqual(after.updatedAt)
  })
  it('garde ce qui a été saisi entre la suppression et l’annulation', () => {
    const before = doc.data
    const [s0, s1] = before.sections
    const typed = patchSection(patchField(removeSection(before, s1.id), before.personal.fields[0].id, { value: 'neuf@x.fr' }), s0.id, { title: 'Profil revu' })
    const cv = cvOf(restoreSnap([{ ...doc, data: typed }], doc.id, { docId: doc.id, data: before, rid: s1.id }))
    expect(cv.sections.map((s) => s.id)).toEqual(before.sections.map((s) => s.id))
    expect(cv.sections[0].title).toBe('Profil revu')
    expect(cv.personal.fields[0].value).toBe('neuf@x.fr')
  })
  it('rétablit une entrée dans sa section, après sa voisine encore présente', () => {
    const before = doc.data
    const s = before.sections.find((x) => x.items.length >= 2)!
    const [a, b] = s.items
    const typed = patchItem(removeItem(before, s.id, b.id), s.id, a.id, { title: 'Titre modifié' })
    const cv = cvOf(restoreSnap([{ ...doc, data: typed }], doc.id, { docId: doc.id, data: before, rid: b.id }))
    const items = cv.sections.find((x) => x.id === s.id)!.items
    expect(items.map((x) => x.id)).toEqual(s.items.map((x) => x.id))
    expect(items[0].title).toBe('Titre modifié')
  })
  it('rétablit un champ personnel et la photo seule', () => {
    const f = doc.data.personal.fields[0]
    expect(cvOf(restoreSnap([{ ...doc, data: removeField(doc.data, f.id) }], doc.id, { docId: doc.id, data: doc.data, rid: f.id })).personal.fields[0].id).toBe(f.id)
    const before = { ...doc.data, personal: { ...doc.data.personal, photo: 'data:image/png;base64,AA' } }
    const now = { ...before, personal: { ...before.personal, photo: '', firstName: 'Zoé' } }
    const p = cvOf(restoreSnap([{ ...doc, data: now }], doc.id, { docId: doc.id, data: before, rid: 'photo' })).personal
    expect(p.photo).toBe(before.personal.photo)
    expect(p.firstName).toBe('Zoé')
  })
  it('ne fait rien si le document n’existe plus, n’est plus actif, a changé de type, ou si la section de l’entrée a disparu', () => {
    const snap = { docId: doc.id, data: doc.data, rid: doc.data.sections[0].id }
    expect(restoreSnap([], 'x', snap)).toBeNull()
    expect(restoreSnap([doc], 'autre', snap)).toBeNull()
    expect(restoreSnap([{ ...doc, id: 'nouveau' }], 'nouveau', snap)).toBeNull()
    expect(restoreSnap([{ ...doc, kind: 'letter' } as never], doc.id, snap)).toBeNull()
    const s = doc.data.sections.find((x) => x.items.length)!
    expect(restoreSnap([{ ...doc, data: removeSection(doc.data, s.id) }], doc.id, { docId: doc.id, data: doc.data, rid: s.items[0].id })).toBeNull()
  })
  it('ne fait rien si l’élément est déjà là', () => {
    expect(restoreSnap([doc], doc.id, { docId: doc.id, data: doc.data, rid: doc.data.sections[0].id })).toBeNull()
  })
})
