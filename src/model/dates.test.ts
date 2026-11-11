import { describe, expect, it } from 'vitest'
import { formatMonthInput, parseMonthInput } from './dates'
import type { Lang } from './types'

const NOW = 2026 // pivot des années à 2 chiffres : 00-36 -> 20xx, 37-99 -> 19xx
const ok = (t: string, lang: Lang = 'fr') => {
  const r = parseMonthInput(t, lang, NOW)
  return r.ok ? r.value : null
}

describe('parseMonthInput : formats numériques', () => {
  it.each([
    ['03/2021', '2021-03'], ['3/2021', '2021-03'], ['03-2021', '2021-03'], ['3.21', '2021-03'], ['03 2021', '2021-03'],
    ['032021', '2021-03'], ['32021', '2021-03'], ['2021', '2021'], ['2021-03', '2021-03'], ['2021/3', '2021-03'], ['202103', '2021-03'],
    ['  03 / 2021  ', '2021-03'], ['12/1999', '1999-12'], ['3/05', '2005-03'], ['11.98', '1998-11'], ['122019', '2019-12'], ['', ''], ['   ', ''],
  ])('%s -> %s', (t, v) => expect(ok(t)).toBe(v))

  it('année à 2 chiffres : jusqu’à l’année courante + 10 -> 20xx, au-delà -> 19xx', () => {
    expect(ok('1/36')).toBe('2036-01')
    expect(ok('1/37')).toBe('1937-01')
    expect(ok('6/00')).toBe('2000-06')
  })
  it.each(['13/2021', '00/2021', '3', '03', '0321', '2021-13', '21/03', '03/2021/1', '1899', '2101', 'abc', '03/20x1', '2021-03-15', '03//'])('refuse %s', (t) => expect(ok(t)).toBeNull())
})

describe('parseMonthInput : noms de mois', () => {
  it.each([
    ['mars 2021', 'fr'], ['Mars 21', 'fr'], ['mar 2021', 'en'], ['Mar 2021', 'en'], ['March 2021', 'en'], ['März 2021', 'de'], ['marz 2021', 'de'], ['Mär 2021', 'de'],
    ['marzo 2021', 'es'], ['marzo de 2021', 'es'], ['marzo 2021', 'it'], ['março 2021', 'pt'], ['março de 2021', 'pt'], ['mars2021', 'fr'], ['2021 mars', 'fr'],
    ['مارس 2021', 'ar'], ['مارس ٢٠٢١', 'ar'],
  ] as [string, Lang][])('%s (%s) -> 2021-03', (t, l) => expect(ok(t, l)).toBe('2021-03'))

  it.each([
    ['janvier 2020', 'fr', '2020-01'], ['févr. 2020', 'fr', '2020-02'], ['fevrier 2020', 'fr', '2020-02'], ['déc 2019', 'fr', '2019-12'], ['sept. 2019', 'fr', '2019-09'],
    ['Sep 2019', 'en', '2019-09'], ['Dec 2019', 'en', '2019-12'], ['Dezember 2019', 'de', '2019-12'], ['Okt 2019', 'de', '2019-10'],
    ['dic 2019', 'es', '2019-12'], ['set 2019', 'pt', '2019-09'], ['settembre 2019', 'it', '2019-09'], ['يناير 2020', 'ar', '2020-01'], ['ديسمبر ٢٠١٩', 'ar', '2019-12'],
  ] as [string, Lang, string][])('%s (%s) -> %s', (t, l, v) => expect(ok(t, l)).toBe(v))

  it('accepte aussi les noms des autres langues', () => {
    expect(ok('March 2021', 'fr')).toBe('2021-03')
    expect(ok('März 2021', 'en')).toBe('2021-03')
  })
  it.each(['2021 2021', 'mars', 'mars mars 2021', 'foo 2021', 'mars 20211', 'mars 202'])('refuse %s', (t) => expect(ok(t)).toBeNull())
})

describe('parseMonthInput : chiffres arabes-indiens', () => {
  it.each([['٠٣/٢٠٢١', '2021-03'], ['٣-٢٠٢١', '2021-03'], ['٢٠٢١', '2021'], ['٣.٢١', '2021-03'], ['۰۳/۲۰۲۱', '2021-03']])('%s -> %s', (t, v) => expect(ok(t, 'ar')).toBe(v))
})

describe('formatMonthInput', () => {
  it('AAAA-MM -> MM/AAAA, AAAA inchangé, reste vide', () => {
    expect(formatMonthInput('2021-03')).toBe('03/2021')
    expect(formatMonthInput('2021')).toBe('2021')
    expect(formatMonthInput('')).toBe('')
    expect(formatMonthInput('n’importe quoi')).toBe('')
  })
})
