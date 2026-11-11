import { describe, expect, it } from 'vitest'
import { cvLabels } from '../i18n/labels'
import { newSections } from '../i18n/newSections'
import { sectionsText, sectionSummary } from '../i18n/sections'
import { ui } from '../i18n/ui'
import { templates } from '../templates'
import { locate } from '../ui/previewMap'
import { exportDocs, newCVDoc, parseImport } from './documents'
import { sampleCV, withNewSections } from './sample'
import { sanitizeCV } from './sanitize'
import { LANGS, NEW_KINDS, ONE_DATE_KINDS, SECTION_KINDS, type CV } from './types'

// Nouvelles sections du 2026-11-11 (docs/wiki/nouvelles-sections.md) : bénévolat, certifications, publications.
describe('nouvelles sections', () => {
  it('trois types de plus, dont deux à date unique', () => {
    expect(NEW_KINDS).toEqual(['volunteering', 'certifications', 'publications'])
    for (const k of NEW_KINDS) expect(SECTION_KINDS).toContain(k)
    expect(ONE_DATE_KINDS).toEqual(['certifications', 'publications'])
  })

  it('titres standards, noms, champs, résumés et date dans les 7 langues', () => {
    for (const l of LANGS) {
      const n = newSections[l]
      expect(n.date.trim()).not.toBe('')
      for (const k of NEW_KINDS) {
        expect(cvLabels[l].sections[k].trim(), `${l} ${k}`).not.toBe('')
        expect(ui[l].kinds[k].trim()).not.toBe('')
        const [title, sub] = ui[l].kindFields[k]
        expect(title && sub, `${l} ${k} champs`).toBeTruthy()
        expect(sectionsText[l].nouns[k].split('|')).toHaveLength(2)
        expect(n.ph[k].title, `${l} ${k} exemple`).toBeTruthy()
      }
      // bénévolat comme une expérience : une description ; certifications et publications : titre, organisme ou revue, date
      expect(ui[l].kindFields.volunteering[2]).not.toBe('')
      expect(ui[l].kindFields.certifications[2]).toBe('')
      expect(ui[l].kindFields.publications[2]).toBe('')
    }
    expect(cvLabels.fr.sections.volunteering).toBe('Bénévolat')
    expect(cvLabels.en.sections.certifications).toBe('Certifications')
  })

  it('résumé replié', () => {
    const items = [{ title: 'AWS Solutions Architect', text: '' }, { title: 'Scrum Master', text: '' }]
    expect(sectionSummary({ kind: 'certifications', items }, 'fr')).toBe('2 certifications · AWS Solutions Architect, Scrum Master')
    expect(sectionSummary({ kind: 'volunteering', items: items.slice(0, 1) }, 'en')).toBe('1 role · AWS Solutions Architect')
  })

  it('nettoyage : les nouveaux types survivent ; date unique = ni fin, ni « en cours », ni lieu, ni texte', () => {
    const raw = {
      lang: 'fr', personal: { firstName: 'A', lastName: '', title: '', photo: '', fields: [] },
      sections: [
        { id: 'v', kind: 'volunteering', title: '', visible: true, items: [{ id: 'v1', title: 'Bénévole', subtitle: 'Banque alimentaire', place: 'Lyon', start: '2020-01', end: '2021-06', current: false, text: '- Tri' }] },
        { id: 'c', kind: 'certifications', title: '', visible: true, collapsed: true, items: [{ id: 'c1', title: 'PSC1', subtitle: 'Croix-Rouge', place: 'Lyon', start: '2022-05', end: '2023-01', current: true, text: 'caché' }] },
        { id: 'p', kind: 'publications', title: 'Articles', visible: false, items: [{ id: 'p1', title: 'Un article', subtitle: 'Revue', start: '2019', end: '2020', text: 'x' }] },
        { id: 'z', kind: 'inconnu', title: '', visible: true, items: [] },
      ],
    }
    const cv = sanitizeCV(raw)
    expect(cv.sections.map((s) => s.kind)).toEqual(['volunteering', 'certifications', 'publications'])
    expect(cv.sections[0].items[0]).toMatchObject({ place: 'Lyon', start: '2020-01', end: '2021-06', text: '- Tri' })
    expect(cv.sections[1]).toMatchObject({ collapsed: true })
    expect(cv.sections[1].items[0]).toMatchObject({ title: 'PSC1', subtitle: 'Croix-Rouge', start: '2022-05', end: '', current: false, place: '', text: '' })
    expect(cv.sections[2]).toMatchObject({ title: 'Articles', visible: false })
    expect(cv.sections[2].items[0]).toMatchObject({ start: '2019', end: '', text: '' })
  })

  it('export puis import JSON : rien ne se perd', () => {
    const cv = withNewSections(sampleCV('fr', 'dev'))
    const [back] = parseImport(exportDocs([newCVDoc('CV', cv)]))
    expect((back.data as CV).sections.map((s) => [s.kind, s.items[0].title])).toEqual(cv.sections.map((s) => [s.kind, s.items[0].title]))
  })

  it('modèles à deux colonnes : certifications à part (colonne latérale ou grille), bénévolat avec l’expérience', () => {
    for (const t of templates.filter((x) => x.columns === 2)) {
      expect(t.apart, t.id).toContain('certifications')
      expect(t.apart).not.toContain('volunteering')
      expect(!!t.apart?.includes('experience')).toBe(false)
    }
  })

  it('aperçu relié : une ligne de certification mène à son champ', () => {
    const cv = withNewSections(sampleCV('fr', 'dev'))
    const cert = cv.sections.find((s) => s.kind === 'certifications')!
    const it0 = cert.items[0]
    const lines = ['Camille Marchand', cvLabels.fr.sections.certifications, it0.title, `${it0.subtitle} · mars 2021`]
    const p = [lines.map((str, i) => ({ str, x: 0.1, y: i * 0.02, w: 0.3, h: 0.01 }))]
    expect(locate(cv, p, 0, 1)).toEqual({ section: cert.id, rid: cert.id, field: 'sectionTitle' })
    expect(locate(cv, p, 0, 2)).toEqual({ section: cert.id, rid: it0.id, field: 'title' })
    expect(locate(cv, p, 0, 3)).toMatchObject({ rid: it0.id, field: 'subtitle' })
  })
})
