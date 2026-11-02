import { LANGS, type Lang } from './types'

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

// ---- Saisie d'une date en un seul champ ----------------------------------------------------------------------

export type MonthInput = { ok: true; value: string } | { ok: false }

const MIN_YEAR = 1900
const MAX_YEAR = 2100
const FILLER = new Set(['de', 'del', 'di', 'of', 'em', 'في']) // « marzo de 2021 », « março de 2021 »

/** Minuscules, sans accents ni point final : « Févr. » -> « fevr ». */
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\.$/, '')

const nameTables = new Map<Lang, Map<string, number>>()
/** Noms longs, courts et abréviations à 3 lettres des 12 mois d'une langue -> n° du mois. */
function monthTable(lang: Lang): Map<string, number> {
  const cached = nameTables.get(lang)
  if (cached) return cached
  const t = new Map<string, number>()
  const prefixes = new Map<string, number | null>() // null = ambigu dans cette langue (« jui » : juin / juillet)
  for (const style of ['long', 'short'] as const)
    monthNames(lang, style).forEach((n, i) => {
      const k = fold(n)
      t.set(k, i + 1)
      if (/^\p{Script=Latin}+$/u.test(k) && k.length > 3) {
        const p = k.slice(0, 3)
        prefixes.set(p, prefixes.has(p) && prefixes.get(p) !== i + 1 ? null : i + 1)
      }
    })
  for (const [p, m] of prefixes) if (m && !t.has(p)) t.set(p, m)
  nameTables.set(lang, t)
  return t
}

const monthFromName = (word: string, lang: Lang): number | undefined => {
  const w = fold(word)
  // La langue du champ d'abord, puis les autres : on saisit « March 2021 » dans un CV en français.
  for (const l of [lang, ...LANGS.filter((x) => x !== lang)]) {
    const m = monthTable(l).get(w)
    if (m) return m
  }
}

/** Année à 2 chiffres : jusqu'à l'année courante + 10 -> 20xx, au-delà -> 19xx (en 2026 : 00-36 -> 2000-2036, 37-99 -> 1937-1999). */
const fullYear = (d: string, nowYear: number) => {
  if (d.length === 4) return +d
  const y = 2000 + +d
  return y > nowYear + 10 ? y - 100 : y
}

const monthOk = (m: number) => m >= 1 && m <= 12
const pad = (m: number) => String(m).padStart(2, '0')

/**
 * Lit une date tapée librement et rend `AAAA-MM` ou `AAAA` (le format de stockage) ; vide -> `''`.
 * Accepte 03/2021, 3-21, 3.21, 032021, 202103, 2021, 2021-03, « mars 2021 », « Mar 2021 », « März 2021 », « مارس ٢٠٢١ »…
 * Un nombre seul n'est une date que s'il est une année à 4 chiffres ou une date compacte (5, 6 chiffres).
 */
export function parseMonthInput(text: string, lang: Lang, nowYear = new Date().getFullYear()): MonthInput {
  const bad: MonthInput = { ok: false }
  // Chiffres arabes-indiens (٠-٩) et persans (۰-۹) -> latins.
  const s = text.replace(/[٠-٩۰-۹]/g, (c) => String(c.charCodeAt(0) - (c < '۰' ? 0x0660 : 0x06f0))).trim()
  if (!s) return { ok: true, value: '' }
  if (/[^\p{L}\p{M}\p{N}\s./\-,]/u.test(s)) return bad
  const toks = (s.match(/\p{L}[\p{L}\p{M}]*|\d+/gu) ?? []).filter((t) => !FILLER.has(fold(t)))
  const done = (y: number, m?: number): MonthInput =>
    y >= MIN_YEAR && y <= MAX_YEAR && (m === undefined || monthOk(m)) ? { ok: true, value: m === undefined ? String(y) : `${y}-${pad(m)}` } : bad
  const num = (t: string) => /^\d+$/.test(t)

  if (toks.length === 1 && num(toks[0])) {
    const d = toks[0]
    if (d.length === 4) return done(+d)
    if (d.length === 6) {
      // AAAAMM si les 4 premiers chiffres sont une année plausible et les 2 derniers un mois ; sinon MMAAAA.
      const y = +d.slice(0, 4)
      return y >= MIN_YEAR && y <= MAX_YEAR && monthOk(+d.slice(4)) ? done(y, +d.slice(4)) : done(+d.slice(2), +d.slice(0, 2))
    }
    return d.length === 5 ? done(+d.slice(1), +d[0]) : bad
  }
  if (toks.length !== 2) return bad
  const [a, b] = toks
  const yearOk = (t: string) => num(t) && (t.length === 2 || t.length === 4)
  if (num(a) && num(b)) {
    if (a.length === 4) return done(+a, +b) // 2021-03
    return a.length <= 2 && yearOk(b) ? done(fullYear(b, nowYear), +a) : bad // 03/2021, 3.21
  }
  // mois en lettres + année, dans un sens ou dans l'autre
  const [word, yr] = num(a) ? [b, a] : [a, b]
  const m = num(word) ? undefined : monthFromName(word, lang)
  return m && yearOk(yr) ? done(fullYear(yr, nowYear), m) : bad
}

/** « 2021-03 » -> « 03/2021 » (chiffres latins, quelle que soit la langue) ; « 2021 » reste « 2021 » ; invalide -> ''. */
export function formatMonthInput(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym)
  return m ? `${m[2]}/${m[1]}` : /^\d{4}$/.test(ym) ? ym : ''
}
