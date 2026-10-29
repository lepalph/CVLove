import type { Lang } from './types'

export const isRtl = (lang: Lang) => lang === 'ar'

// Chiffres latins en arabe (« ar-u-nu-latn ») : cohérents avec téléphones et e-mails, et présents dans la police.
const locale = (lang: Lang) => (lang === 'ar' ? 'ar-u-nu-latn' : lang)

const fmtMonth = (lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { month: 'short', year: 'numeric', timeZone: 'UTC' })
const fmtDay = (lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { dateStyle: 'long', timeZone: 'UTC' })

/** « 2021-03 » -> « mars 2021 » (court, selon la langue) ; l'année seule (« 2021 ») reste « 2021 ». Vide ou invalide -> ''. */
export function formatMonth(ym: string, lang: Lang): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym)
  if (!m) return /^\d{4}$/.test(ym) ? ym : ''
  return fmtMonth(lang).format(new Date(Date.UTC(+m[1], +m[2] - 1, 1)))
}

/** « 1994-06-12 » -> « 12 juin 1994 ». */
export function formatDay(ymd: string, lang: Lang): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return ''
  return fmtDay(lang).format(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])))
}

/** Période d'un item : « mars 2021 – Présent ». `present` vient du dictionnaire de libellés. */
export function formatPeriod(
  it: { start: string; end: string; current: boolean },
  lang: Lang,
  present: string,
): string {
  const s = formatMonth(it.start, lang)
  const e = it.current ? present : formatMonth(it.end, lang)
  if (s && e) return `${s} – ${e}`
  return s || e
}

/** Noms des 12 mois en toutes lettres, dans la langue (pour les listes « Mois »). */
export const monthNames = (lang: Lang, month: 'long' | 'short' = 'long'): string[] => {
  const f = new Intl.DateTimeFormat(locale(lang), { month, timeZone: 'UTC' })
  return Array.from({ length: 12 }, (_, i) => f.format(new Date(Date.UTC(2000, i, 1))))
}
