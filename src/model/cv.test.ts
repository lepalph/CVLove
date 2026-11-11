import { describe, expect, it } from 'vitest'
import { cvLabels, sectionTitle } from '../i18n/labels'
import { detectLang } from '../i18n/ui'
import {
  addItem, addSection, applyDesignPatch, DEFAULT_DESIGN, emptyCV, moveItem, moveSection, moveSectionTo, patchItem, setCollapsed, patchSection, pdfFileName, removeItem, removeSection,
  setLang, visibleSections,
} from './cv'
import { cleanDesign, sanitizeCV } from './sanitize'
import { formatDay, formatMonth, formatPeriod, isRtl } from './dates'
import { sampleCV } from './sample'
import { LANGS } from './types'

describe('sections', () => {
  it('ajoute et supprime une section', () => {
    const cv = addSection(emptyCV(), 'education')
    expect(cv.sections.map((s) => s.kind)).toEqual(['education'])
    expect(removeSection(cv, cv.sections[0].id).sections).toEqual([])
  })

  it('réordonne les sections et ignore les bornes', () => {
    let cv = emptyCV()
    for (const k of ['profile', 'experience', 'skills'] as const) cv = addSection(cv, k)
    const [a, b, c] = cv.sections.map((s) => s.id)
    cv = moveSection(cv, c, -1)
    expect(cv.sections.map((s) => s.id)).toEqual([a, c, b])
    expect(moveSection(cv, a, -1).sections).toBe(cv.sections)
    expect(moveSection(cv, b, 1).sections).toBe(cv.sections)
  })

  it('déplace une section à un rang donné, une seule mise à jour', () => {
    let cv = emptyCV()
    for (const k of ['profile', 'experience', 'skills', 'education'] as const) cv = addSection(cv, k)
    const [a, b, c, d] = cv.sections.map((s) => s.id)
    expect(moveSectionTo(cv, a, 2).sections.map((s) => s.id)).toEqual([b, c, a, d])
    expect(moveSectionTo(cv, d, 0).sections.map((s) => s.id)).toEqual([d, a, b, c])
    expect(moveSectionTo(cv, b, 99).sections.map((s) => s.id)).toEqual([a, c, d, b])
    expect(moveSectionTo(cv, b, 1)).toBe(cv)
    expect(moveSectionTo(cv, 'x', 0)).toBe(cv)
  })

  it('replie des sections (toutes, ou celles données)', () => {
    let cv = emptyCV()
    for (const k of ['profile', 'experience'] as const) cv = addSection(cv, k)
    const [a, b] = cv.sections.map((s) => s.id)
    expect(setCollapsed(cv, true).sections.map((s) => s.collapsed)).toEqual([true, true])
    cv = setCollapsed(cv, true, [b])
    expect(cv.sections.map((s) => s.collapsed)).toEqual([undefined, true])
    expect(setCollapsed(cv, false).sections.some((s) => s.collapsed)).toBe(false)
    expect(a).toBeTruthy()
  })

  it("l'état replié survit à l'import, seul `true` est gardé", () => {
    const cv = addSection(addSection(emptyCV(), 'profile'), 'skills')
    const raw = { ...cv, sections: [{ ...cv.sections[0], collapsed: true }, { ...cv.sections[1], collapsed: 'oui' }] }
    expect(sanitizeCV(raw).sections.map((s) => s.collapsed)).toEqual([true, undefined])
  })

  it('ajoute, réordonne et supprime des items', () => {
    let cv = addSection(emptyCV(), 'experience')
    const sid = cv.sections[0].id
    cv = addItem(cv, sid)
    const [i1, i2] = cv.sections[0].items.map((i) => i.id)
    cv = patchItem(cv, sid, i1, { title: 'A' })
    cv = moveItem(cv, sid, i1, 1)
    expect(cv.sections[0].items.map((i) => i.id)).toEqual([i2, i1])
    cv = removeItem(cv, sid, i2)
    expect(cv.sections[0].items.map((i) => i.title)).toEqual(['A'])
  })

  it('masque les sections cachées et vides', () => {
    let cv = sampleCV('fr', 'dev')
    const n = visibleSections(cv).length
    cv = patchSection(cv, cv.sections[0].id, { visible: false })
    expect(visibleSections(cv)).toHaveLength(n - 1)
    cv = addSection(cv, 'projects') // item vide : rien à dessiner
    expect(visibleSections(cv)).toHaveLength(n - 1)
  })
})

describe('langue du CV', () => {
  it('ne touche ni au contenu ni aux titres personnalisés', () => {
    let cv = sampleCV('fr', 'dev')
    cv = patchSection(cv, cv.sections[1].id, { title: 'Mon parcours' })
    const before = JSON.stringify({ ...cv, lang: undefined })
    for (const lang of LANGS) {
      const next = setLang(cv, lang)
      expect(next.lang).toBe(lang)
      expect(JSON.stringify({ ...next, lang: undefined })).toBe(before)
    }
  })

  it('garde le titre personnalisé, sinon prend le libellé de la langue', () => {
    let cv = sampleCV('fr', 'dev')
    cv = patchSection(cv, cv.sections[1].id, { title: 'Mon parcours' })
    const [custom, plain] = [cv.sections[1], cv.sections[2]]
    for (const lang of LANGS) {
      expect(sectionTitle(custom, cvLabels[lang])).toBe('Mon parcours')
      expect(sectionTitle(plain, cvLabels[lang])).toBe(cvLabels[lang].sections[plain.kind])
    }
  })

  it('a tous les libellés dans les 7 langues', () => {
    for (const lang of LANGS) {
      const l = cvLabels[lang]
      expect(Object.values(l.sections).every(Boolean) && l.present && l.born).toBeTruthy()
    }
    expect(new Set(LANGS.map((l) => cvLabels[l].sections.education)).size).toBeGreaterThanOrEqual(6)
  })
})

describe('dates', () => {
  it('formate le mois selon la langue', () => {
    expect(formatMonth('2021-03', 'fr')).toBe('mars 2021')
    expect(formatMonth('2021-03', 'en')).toBe('Mar 2021')
    expect(formatMonth('2021-03', 'de')).toBe('März 2021')
    expect(formatMonth('2021-03', 'es')).toMatch(/mar.* 2021/)
    expect(formatMonth('2021-03', 'ar')).toContain('مارس')
    expect(formatMonth('2021-03', 'ar')).toContain('2021') // chiffres latins
    expect(formatMonth('', 'fr')).toBe('')
    expect(formatMonth('n’importe quoi', 'fr')).toBe('')
  })

  it('formate un jour complet', () => {
    expect(formatDay('1994-06-12', 'fr')).toBe('12 juin 1994')
    expect(formatDay('1994-06-12', 'en')).toBe('June 12, 1994')
  })

  it('formate une période, avec « en cours »', () => {
    const it = { start: '2021-03', end: '', current: true }
    expect(formatPeriod(it, 'fr', cvLabels.fr.present)).toBe('mars 2021 – Présent')
    expect(formatPeriod({ start: '2018-09', end: '2021-02', current: false }, 'en', 'Present')).toBe('Sep 2018 – Feb 2021')
    expect(formatPeriod({ start: '', end: '', current: false }, 'fr', 'x')).toBe('')
  })

  it('RTL seulement pour l’arabe', () => {
    expect(LANGS.filter(isRtl)).toEqual(['ar'])
  })
})

describe('design', () => {
  const preset = { accent: '#111111', fontPair: 'lora' as const, margins: 'large' as const }
  it('applique le preset du style sans choix manuel', () => {
    const d = applyDesignPatch(DEFAULT_DESIGN, { ...preset, templateId: 'moderne-2' })
    expect(d.accent).toBe('#111111')
    expect(d.custom).toBeUndefined()
  })
  it('garde la couleur et la police choisies à la main au changement de modèle', () => {
    let d = applyDesignPatch(DEFAULT_DESIGN, { accent: '#047857' })
    d = applyDesignPatch(d, { fontPair: 'inter' })
    d = applyDesignPatch(d, { ...preset, templateId: 'moderne-2' })
    expect(d).toMatchObject({ accent: '#047857', fontPair: 'inter', margins: 'large', templateId: 'moderne-2' })
  })
  it('nettoie le champ custom', () => {
    expect(cleanDesign({ custom: { accent: 'rouge', fontPair: 'nope' } }).custom).toBeUndefined()
    expect(cleanDesign({ custom: { accent: '#047857' } }).custom).toEqual({ accent: '#047857' })
  })
})

describe('divers', () => {
  it('nomme le fichier CV-Prenom-Nom.pdf', () => {
    const cv = emptyCV()
    cv.personal.firstName = 'Zoë'
    cv.personal.lastName = 'Dupont-Martin'
    expect(pdfFileName(cv)).toBe('CV-Zoe-Dupont-Martin.pdf')
    expect(pdfFileName(emptyCV())).toBe('CV-CVLove.pdf')
    const ar = emptyCV('ar')
    ar.personal.firstName = 'أمينة'; ar.personal.lastName = 'بن علي'
    expect(pdfFileName(ar)).toBe('CV-أمينة-بن-علي.pdf')
  })

  it('détecte la langue de l’interface', () => {
    expect(detectLang('fr-CA')).toBe('fr')
    expect(detectLang('ar-EG')).toBe('ar')
    expect(detectLang('ja-JP')).toBe('en')
  })
})
