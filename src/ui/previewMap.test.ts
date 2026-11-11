import { describe, expect, it } from 'vitest'
import { sampleCV } from '../model/sample'
import { lineAt, linesOf, locate, type TextLine } from './previewMap'

const L = (str: string, y = 0): TextLine => ({ str, x: 0.1, y, w: 0.3, h: 0.01 })
const page = (strs: string[]) => [strs.map((s, i) => L(s, i * 0.02))]
const at = (cv: ReturnType<typeof sampleCV>, strs: string[], str: string, nth = 0) => {
  const p = page(strs)
  const i = strs.map((s, k) => [s, k] as const).filter(([s]) => s === str)[nth][1]
  return locate(cv, p, 0, i)
}

describe('aperçu relié : ligne du PDF → champ', () => {
  const cv = sampleCV('fr', 'dev')
  const exp = cv.sections.find((s) => s.kind === 'experience')!
  const skills = cv.sections.find((s) => s.kind === 'skills')!
  // Lignes telles que pdf.js les extrait du modèle Moderne (colonne principale puis latérale).
  const lines = ['Camille Marchand', 'Développeuse web full-stack', 'Profil', 'Expérience professionnelle', 'Développeuse front-end',
    'Studio Pivoine · Villeurbanne | sept. 2018 – févr. 2021', '•', 'Amélioration des performances : LCP divisé par deux', 'Formation',
    'Université Claude-Bernard Lyon 1 | sept. 2016 – juin 2018', 'Université Claude-Bernard Lyon 1 | sept. 2013 – juin 2016',
    'Contact', 'Compétences', 'Expert', 'Avancé', 'Avancé', 'C1 · Avancé', 'mars 2021 – Présent']

  it('nom, poste, titre de section, sous-titre, puce coupée', () => {
    expect(at(cv, lines, 'Camille Marchand')).toEqual({ field: 'firstName' })
    expect(at(cv, lines, 'Développeuse web full-stack')).toEqual({ field: 'jobTitle' })
    expect(at(cv, lines, 'Développeuse front-end')).toEqual({ section: exp.id, rid: exp.items[1].id, field: 'title' })
    expect(at(cv, lines, 'Studio Pivoine · Villeurbanne | sept. 2018 – févr. 2021')).toMatchObject({ rid: exp.items[1].id, field: 'subtitle' })
    expect(at(cv, lines, 'Amélioration des performances : LCP divisé par deux')).toMatchObject({ rid: exp.items[1].id, field: 'text' })
    expect(at(cv, lines, 'Compétences')).toEqual({ section: skills.id, rid: skills.id, field: 'sectionTitle' })
    expect(at(cv, lines, 'Profil')?.field).toBe('sectionTitle')
  })

  it('doublons : les dates départagent, sinon l’ordre du CV', () => {
    const edu = cv.sections.find((s) => s.kind === 'education')!
    expect(at(cv, lines, 'Université Claude-Bernard Lyon 1 | sept. 2016 – juin 2018')?.rid).toBe(edu.items[0].id)
    expect(at(cv, lines, 'Université Claude-Bernard Lyon 1 | sept. 2013 – juin 2016')?.rid).toBe(edu.items[1].id)
    expect(at(cv, lines, 'Avancé', 0)).toEqual({ section: skills.id, rid: skills.items[1].id, field: 'level' })
    expect(at(cv, lines, 'Avancé', 1)).toEqual({ section: skills.id, rid: skills.items[2].id, field: 'level' })
    expect(at(cv, lines, 'C1 · Avancé')?.field).toBe('cefr')
    expect(at(cv, lines, 'mars 2021 – Présent')).toMatchObject({ rid: exp.items[0].id, field: 'start' })
  })

  it('texte du modèle absent du CV, puce seule : rien', () => {
    expect(at(cv, lines, 'Contact')).toBeNull()
    expect(at(cv, lines, '•')).toBeNull()
  })

  it('arabe : lettres extraites dans le désordre (lam-alif), chiffres et ٪ inversés', () => {
    const ar = sampleCV('ar', 'dev')
    const e = ar.sections.find((s) => s.kind === 'experience')!
    const strs = ['تحسين األداء وتقليص زمن التحميل إلى النصف', 'إعادة تصميم مسار الشراء مع زيادة التحويل بنسبة ٪18', 'الخبرة المهنية', 'مطورة واجهات أمامية']
    expect(at(ar, strs, strs[0])).toMatchObject({ rid: e.items[1].id, field: 'text' })
    expect(at(ar, strs, strs[1])).toMatchObject({ rid: e.items[0].id, field: 'text' })
    expect(at(ar, strs, strs[2])).toMatchObject({ rid: e.id, field: 'sectionTitle' })
    expect(at(ar, strs, strs[3])).toMatchObject({ rid: e.items[1].id, field: 'title' })
  })

  it('lineAt : la ligne sous le point, rien à côté', () => {
    const ls = [L('Titre', 0.1), L('•', 0.2), { ...L('Texte', 0.2), x: 0.12 }]
    expect(lineAt(ls, 0.2, 0.105)).toBe(0)
    expect(lineAt(ls, 0.2, 0.205)).toBe(2)
    expect(lineAt(ls, 0.9, 0.105)).toBe(-1)
  })
})

describe('aperçu relié : champ → lignes à allumer', () => {
  const cv = sampleCV('fr', 'dev')
  const exp = cv.sections.find((s) => s.kind === 'experience')!
  const pages = [['Camille Marchand', 'Développeuse front-end', 'Studio Pivoine · Villeurbanne | sept. 2018 – févr. 2021', 'Formation'].map((s, i) => L(s, i * 0.02))]
  it('nom : Prénom et Nom allument la même ligne', () => {
    expect(linesOf(cv, pages, undefined, 'firstName')).toEqual([[0, 0]])
    expect(linesOf(cv, pages, undefined, 'lastName')).toEqual([[0, 0]])
  })
  it('entrée : champ exact, sinon la ligne de la même entrée ; rien si absent', () => {
    expect(linesOf(cv, pages, exp.items[1].id, 'title')).toEqual([[0, 1]])
    expect(linesOf(cv, pages, exp.items[1].id, 'place')).toEqual([[0, 1], [0, 2]]) // repli : toute l'entrée
    expect(linesOf(cv, pages, 'inconnu', 'title')).toEqual([])
  })
})
