import { cefrText } from '../i18n/cefr'
import { cvLabels, sectionTitle } from '../i18n/labels'
import { visibleFields, visibleSections } from '../model/cv'
import { formatDay, formatPeriod } from '../model/dates'
import type { CV } from '../model/types'

/**
 * Aperçu relié au formulaire (docs/wiki/apercu-relie.md) : on retrouve le champ d'une ligne de l'aperçu en comparant son texte (couche
 * de texte de pdf.js) aux données du CV. Rien n'est ajouté au PDF : le fichier téléchargé reste le même octet pour octet.
 */

/** Une ligne de texte d'une page de l'aperçu, en fractions de la page (0..1, origine en haut à gauche). */
export interface TextLine { str: string; x: number; y: number; w: number; h: number }

/** Champ du formulaire : `[data-rid=rid] [data-field=field]` (sans `rid` : carte Informations personnelles). `section` : à déplier. */
export interface Target { section?: string; rid?: string; field: string }

/**
 * Mots comparables : NFKC (formes de présentation arabes, ligatures), minuscules, sans diacritiques, et lettres triées.
 * Trier les lettres absorbe l'ordre faux du texte extrait en arabe : la ligature lam-alif sort « األداء » pour « الأداء ».
 */
export const words = (s: string) =>
  s.normalize('NFKC').toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((w) => [...w].sort().join(''))

interface Fld { field: string; words: Set<string>; second?: boolean }
interface Group { target: Omit<Target, 'field'>; fields: Fld[]; all: Set<string> }

const fld = (field: string, text: string, second?: boolean): Fld => ({ field, words: new Set(words(text)), second })
const group = (target: Group['target'], fields: Fld[]): Group => ({ target, fields, all: new Set(fields.flatMap((f) => [...f.words])) })

/** Ce que le PDF peut imprimer de chaque élément, dans l'ordre du CV. Dates et niveaux sont mis en forme comme dans les modèles. */
function groups(cv: CV): Group[] {
  const labels = cvLabels[cv.lang]
  const p = cv.personal
  const out = [
    group({}, [fld('firstName', p.firstName), fld('lastName', p.lastName)]),
    group({}, [fld('jobTitle', p.title)]),
    ...visibleFields(cv).map((f) => group({ rid: f.id }, [fld('value', `${f.label ?? ''} ${f.value} ${f.kind === 'birthDate' ? `${labels.born} ${formatDay(f.value, cv.lang)}` : ''}`)])),
  ]
  for (const s of visibleSections(cv)) {
    out.push(group({ section: s.id, rid: s.id }, [fld('sectionTitle', sectionTitle(s, labels))]))
    for (const it of s.items) out.push(group({ section: s.id, rid: it.id }, [
      fld('title', it.title), fld('subtitle', it.subtitle), fld('place', it.place), fld('text', it.text),
      fld('start', formatPeriod(it, cv.lang, labels.present), true),
      fld('level', it.level ? labels.levels[it.level - 1] : '', true),
      fld('cefr', it.cefr ? cefrText(it.cefr, cv.lang) : '', true),
    ]))
  }
  return out
}

const hits = (a: string[], b: Set<string>) => a.filter((w) => b.has(w)).length

/** Champ d'un groupe pour ces mots : le texte saisi d'abord ; la date ou le niveau seulement si rien d'autre ne correspond. */
function bestField(ws: string[], g: Group) {
  let best: { f: Fld; n: number; spec: number } | undefined
  for (const second of [false, true]) {
    for (const f of g.fields.filter((x) => !!x.second === second)) {
      const n = hits(ws, f.words)
      if (n && (!best || n > best.n)) best = { f, n, spec: n / f.words.size }
    }
    if (best) return best
  }
}

/**
 * Champ de la ligne `i` de la page `page`. On garde les éléments qui couvrent le plus de mots de la ligne (au moins la moitié), puis
 * le champ le plus précis (« Compétences » : le titre de section plutôt qu'une description qui contient le mot). À égalité (« Avancé »
 * deux fois), la n-ième ligne identique va au n-ième élément dans l'ordre du CV.
 */
export function locate(cv: CV, pages: TextLine[][], page: number, i: number): Target | null {
  const line = pages[page]?.[i]
  const ws = line ? words(line.str) : []
  if (!ws.length) return null
  const scored = groups(cv).map((g) => ({ g, cov: hits(ws, g.all) / ws.length, f: bestField(ws, g) }))
  const cov = Math.max(...scored.map((x) => x.cov))
  if (cov < 0.5) return null
  const top = scored.filter((x) => x.cov === cov && x.f)
  const spec = Math.max(...top.map((x) => x.f!.spec))
  const tied = top.filter((x) => Math.abs(x.f!.spec - spec) < 1e-9)
  const key = ws.join(' ')
  const before = pages.slice(0, page).flat().concat(pages[page].slice(0, i)).filter((l) => words(l.str).join(' ') === key).length
  const { g, f } = tied[Math.min(before, tied.length - 1)]
  return { ...g.target, field: f!.f.field }
}

/** Ligne sous le point (fractions de la page), ou -1. Marge de 0,4 % autour de chaque ligne ; la plus petite gagne. */
export function lineAt(lines: TextLine[], x: number, y: number) {
  const m = 0.004
  let best = -1
  lines.forEach((l, i) => {
    if (x < l.x - m || x > l.x + l.w + m || y < l.y - m || y > l.y + l.h + m || !words(l.str).length) return
    if (best < 0 || l.w * l.h < lines[best].w * lines[best].h) best = i
  })
  return best
}

/** Élément du formulaire pour une cible ; à défaut du champ exact, le premier champ de la ligne. Absent (mode guidé, autre étape) : null. */
export function fieldEl(t: Target) {
  const row = t.rid ? document.querySelector(`[data-rid="${CSS.escape(t.rid)}"]`) : document
  return row?.querySelector<HTMLElement>(`[data-field="${t.field}"]`)
    ?? (t.rid ? row?.querySelector<HTMLElement>('input:not([type=file]):not([type=checkbox]), select, textarea') : null) ?? null
}
