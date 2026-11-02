import { describe, expect, it } from 'vitest'
import { DEFAULT_DESIGN, removeField, removeSection } from './cv'
import { sampleCV } from './sample'
import { newCVDoc } from './documents'
import { restoreSnap } from './undo'

const doc = newCVDoc('CV', sampleCV('fr'), DEFAULT_DESIGN)

describe('annuler une suppression : restoreSnap', () => {
  it('rétablit le contenu d’avant, à la même place, sans toucher au design', () => {
    const before = doc.data
    const id = before.sections[1].id
    const after = { ...doc, data: removeSection(before, id), design: { ...doc.design, accent: '#123456' } }
    const out = restoreSnap([after], doc.id, { docId: doc.id, data: before })!
    expect(out[0].kind === 'cv' && out[0].data).toEqual(before)
    expect(out[0].kind === 'cv' && out[0].data.sections[1].id).toBe(id)
    expect(out[0].design.accent).toBe('#123456')
    expect(out[0].updatedAt).toBeGreaterThanOrEqual(after.updatedAt)
  })
  it('ne fait rien si le document n’existe plus, n’est pas le document actif ou a changé de type', () => {
    const snap = { docId: doc.id, data: doc.data }
    expect(restoreSnap([], 'x', snap)).toBeNull()
    expect(restoreSnap([doc], 'autre', snap)).toBeNull()
    expect(restoreSnap([{ ...doc, id: 'nouveau' }], 'nouveau', snap)).toBeNull()
    expect(restoreSnap([{ ...doc, kind: 'letter' } as never], doc.id, snap)).toBeNull()
  })
  it('rétablit un champ personnel supprimé', () => {
    const f = doc.data.personal.fields[0]
    const after = { ...doc, data: removeField(doc.data, f.id) }
    const out = restoreSnap([after], doc.id, { docId: doc.id, data: doc.data })!
    expect(out[0].kind === 'cv' && out[0].data.personal.fields[0].id).toBe(f.id)
  })
})
