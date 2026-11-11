import { useEffect, useRef, useState, type ReactNode } from 'react'
import { sectionTitle, cvLabels } from '../i18n/labels'
import { guide } from '../i18n/guide'
import { guideLight } from '../i18n/guideLight'
import { tips } from '../i18n/tips'
import { ui } from '../i18n/ui'
import { fullName, visibleSections } from '../model/cv'
import type { SectionKind } from '../model/types'
import { useCvDoc, useStore } from '../store'
import { getTemplate, templates } from '../templates'
import { LANG_NAMES } from './bits'
import { DesignSettings, ModelGallery } from './DesignPanel'
import { LetterLink } from './LetterLink'
import { shortStep, modelName, isEmptyCV } from './lib'
import { useClearAll } from './ExampleTools'
import { exportJson, LanguageCard, PersonalCard, SectionsCard } from './Form'

/** Ordre des étapes ; `guide.steps` et `guide.hints` suivent le même ordre, sauf la dernière (design + téléchargement : `guideLight`). */
const STEPS = ['model', 'identity', 'profile', 'experience', 'education', 'skills', 'others', 'design'] as const

/** Sections qui remplissent une étape (les autres étapes comptent comme remplies dès qu'on les a passées par Suivant). */
const FILLS: Partial<Record<(typeof STEPS)[number], SectionKind[]>> = {
  profile: ['profile'], experience: ['experience'], education: ['education'], skills: ['skills', 'languages'], others: ['projects', 'interests', 'custom'],
}

const fill = (text: string, n: number, total: number) => text.replace('{n}', String(n)).replace('{total}', String(total))

/** Posé par l'accueil quand un modèle y est choisi : le prochain éditeur s'ouvre à l'étape Identité (l'étape Modèle est déjà faite). */
export const guidedStart = { afterModel: false }

/** Étape en cours et étapes faites, gardées par l'éditeur pour survivre à la bascule Guidé / Complet (repart de zéro si le document change). */
export function useGuidedProgress(id?: string) {
  const cvId = useCvDoc().id
  const docId = id ?? cvId
  const filledCv = !isEmptyCV(useCvDoc().data)
  const [p, setP] = useState(() => ((guidedStart.afterModel || filledCv) && !id ? { docId, i: 1, done: new Set([0]) } : { docId, i: 0, done: new Set<number>() }))
  useEffect(() => { guidedStart.afterModel = false }, [])
  return p.docId === docId ? { p, setP } : { p: { docId, i: 0, done: new Set<number>() }, setP }
}
export type GuidedProgress = ReturnType<typeof useGuidedProgress>

/** Mode guidé du CV : une étape à la fois, qui réutilise les cartes du formulaire complet. L'aperçu reste dans l'éditeur. */
export function Guided({ progress, onDownload, downloading, saved }: { progress: GuidedProgress; onDownload: () => void; downloading: boolean; saved?: string }) {
  const uiLang = useStore((s) => s.uiLang)
  const g = guide[uiLang]
  const cv = useCvDoc().data
  const kinds = visibleSections(cv).map((s) => s.kind)
  const filled = (i: number) => {
    const step = STEPS[i]
    if (step === 'identity') return !!fullName(cv)
    return FILLS[step] ? FILLS[step]!.some((k) => kinds.includes(k)) : true
  }
  const gl = guideLight[uiLang]
  const names = [...g.steps.slice(0, STEPS.length - 1), gl.lastStep]
  const hints = [...g.hints.slice(0, STEPS.length - 1), gl.lastHint]
  return (
    <Steps progress={progress} names={names} hints={hints} tips={tips[uiLang].steps} filled={filled}>
      {(i) => <StepBody step={STEPS[i]} onDownload={onDownload} downloading={downloading} saved={saved} />}
    </Steps>
  )
}

/** Cadre commun des modes guidés (CV et lettre) : barre d'étapes, titre, indication, Précédent / Passer / Suivant. `children(i)` = corps de l'étape i. `filled(i)` : l'étape a du contenu (sinon elle n'est jamais « faite »). */
export function Steps({ progress, names, hints, tips: tipList, filled, children }: { progress: GuidedProgress; names: string[]; hints: string[]; tips?: string[]; filled?: (i: number) => boolean; children: (i: number) => ReactNode }) {
  const uiLang = useStore((s) => s.uiLang)
  const g = guide[uiLang]
  const total = names.length
  const LAST = total - 1
  const { p, setP } = progress
  const { i, done } = p
  const setI = (n: number) => setP({ ...p, i: n })
  const head = useRef<HTMLHeadingElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  // À chaque changement d'étape : on remonte en haut du formulaire et on met le focus sur le titre (lecteurs d'écran, clavier).
  useEffect(() => {
    if (first.current) { first.current = false; return }
    head.current?.focus({ preventScroll: true })
    // Bureau : le panneau gauche défile seul, on le remet en haut. Mobile (panneau non défilant) : c'est la page.
    const pane = top.current?.closest<HTMLElement>('.overflow-y-auto')
    if (pane && pane.scrollHeight > pane.clientHeight) pane.scrollTo({ top: 0 })
    else top.current?.scrollIntoView({ block: 'start' })
  }, [i])

  const num = (k: number) => String(k + 1).padStart(2, '0')
  // « Faite » = passée par Suivant ET remplie (`filled`) : Suivant sur une étape vide ne la coche pas.
  const isDone = (k: number) => done.has(k) && k !== i && (filled?.(k) ?? true)

  const next = () => setP({ ...p, i: i + 1, done: new Set(done).add(i) })

  return (
    <div ref={top} className="flex flex-col gap-6">
      <nav aria-label={g.stepsLabel} className="flex items-center gap-3 sm:hidden">
        <span className="whitespace-nowrap font-mono text-sm text-muted">{fill(g.stepOf, i + 1, total)}</span>
        <select aria-label={g.stepsLabel} className="inp font-mono" value={i} onChange={(e) => setI(+e.target.value)}>
          {names.map((name, k) => <option key={name} value={k}>{num(k)} {name}{isDone(k) ? ` (${g.stepDone})` : ''}</option>)}
        </select>
      </nav>
      {/* Barre d'étapes : « 01 Modèle » en mono ; l'étape courante porte son nom complet, les autres le premier mot. */}
      <nav aria-label={g.stepsLabel} className="max-sm:hidden">
        <ol className="m-0 flex list-none flex-wrap gap-1 p-0">
          {names.map((name, k) => (
            <li key={name} className="flex-auto">
              <button type="button" aria-current={k === i ? 'step' : undefined} aria-label={isDone(k) ? `${name} (${g.stepDone})` : name} title={name} onClick={() => setI(k)}
                className={`flex min-h-11 w-full items-center gap-1.5 rounded-ctl border px-2.5 text-start font-mono text-[13px] transition-colors duration-150 ${
                  k === i ? 'border-ink bg-ink text-desk' : isDone(k) ? 'border-ink text-ink hover:bg-sunk' : 'border-edge text-muted hover:border-faint hover:text-ink'}`}>
                <span dir="ltr" className="tabular-nums">{num(k)}</span>
                <span className="truncate">{k === i ? name : shortStep(name)}</span>
                {isDone(k) && <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="ms-auto shrink-0 fill-none stroke-current stroke-2"><path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section aria-labelledby="step-title" className="flex flex-col gap-5">
        <header>
          <p className="max-sm:hidden font-mono text-xs uppercase tracking-wide text-muted">{fill(g.stepOf, i + 1, total)}</p>
          <h2 id="step-title" ref={head} tabIndex={-1} className="mt-1 text-xl font-semibold tracking-tight outline-none">{names[i]}</h2>
          <p className="mt-1 text-pretty text-base text-muted">{hints[i]}</p>
          {tipList?.[i] && <p className="mt-2 text-pretty text-sm text-muted">{tipList[i]}</p>}
        </header>
        {children(i)}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
        <button type="button" className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>{g.prev}</button>
        {i < LAST && (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setI(i + 1)}>{g.skip}</button>
            <button type="button" className="btn btn-primary" onClick={next}>{g.next}</button>
          </div>
        )}
      </div>
    </div>
  )
}

function StepBody({ step, onDownload, downloading, saved }: { step: (typeof STEPS)[number]; onDownload: () => void; downloading: boolean; saved?: string }): ReactNode {
  switch (step) {
    case 'model': return <ModelStep />
    case 'identity': return <><LanguageCard /><PersonalCard /></>
    case 'profile': return <SectionsCard only={['profile']} add={['profile']} title={false} />
    case 'experience': return <SectionsCard only={['experience']} add={['experience']} title={false} />
    case 'education': return <SectionsCard only={['education']} add={['education']} title={false} />
    case 'skills': return <SectionsCard only={['skills', 'languages']} add={['skills', 'languages']} title={false} />
    case 'others': return <SectionsCard only={['projects', 'interests', 'custom']} title={false} />
    case 'design': return <><DesignSettings /><Finish onDownload={onDownload} downloading={downloading} saved={saved} /></>
  }
}

/** Les 6 modèles de l'étape Modèle : une ou deux colonnes, avec ou sans photo, sobre ou créatif. */
const SHORT_LIST = ['classique-1', 'executif-1', 'minimal-2', 'moderne-1', 'compact-1', 'creatif-1']

/** Étape Modèle : rappelle le modèle choisi (venu de l'accueil ou d'ici) et amène sa vignette dans la vue. */
function ModelStep() {
  const uiLang = useStore((s) => s.uiLang)
  const id = useCvDoc().design.templateId
  const ref = useRef<HTMLDivElement>(null)
  const [all, setAll] = useState(false)
  const gl = guideLight[uiLang]
  // Le modèle déjà choisi reste visible même hors des 6.
  const only = SHORT_LIST.includes(id) ? SHORT_LIST : [...SHORT_LIST, id]
  // Seulement si la vignette est hors de l'écran : sinon on garderait le haut du panneau (exemples, étapes) caché.
  useEffect(() => {
    const el = ref.current?.querySelector('ul [aria-pressed="true"]')
    if (el && el.getBoundingClientRect().top > innerHeight) el.scrollIntoView({ block: 'center' })
  }, [])
  return (
    <div ref={ref} className="flex flex-col gap-4">
      <p className="m-0 text-base font-medium">{tips[uiLang].chosen.replace('{name}', modelName(getTemplate(id), uiLang))}</p>
      <ModelGallery tall only={all ? undefined : only} />
      <button type="button" className="btn btn-ghost self-start" onClick={() => setAll(!all)}>{all ? gl.showFew : gl.showAll.replace('{n}', String(templates.length))}</button>
    </div>
  )
}

function Finish({ onDownload, downloading, saved }: { onDownload: () => void; downloading: boolean; saved?: string }) {
  const doc = useCvDoc()
  const uiLang = useStore((s) => s.uiLang)
  const g = guide[uiLang]
  const t = ui[uiLang]
  const { data: cv, design } = doc
  const clear = useClearAll()
  const m = getTemplate(design.templateId)
  const labels = cvLabels[cv.lang]
  const rows: [string, string][] = [
    [t.template, modelName(m, uiLang)],
    [t.cvLang, LANG_NAMES[cv.lang]],
    ...visibleSections(cv).map((s): [string, string] => [sectionTitle(s, labels), String(s.items.length)]),
  ]
  return (
    <>
      <div className="border-t border-line pt-5">
        <h3 className="text-base font-semibold">{g.recap}</h3>
        <p className="mt-1 text-lg font-medium">{fullName(cv) || '—'}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          {rows.map(([k, v], n) => (
            <div key={n} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd className="m-0 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <p className="text-pretty text-sm text-muted">{g.readyText}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" onClick={onDownload} aria-busy={downloading}>{t.download}</button>
          <button type="button" className="btn" onClick={() => exportJson(doc)}>{t.exportJson}</button>
          <LetterLink />
          <a href="#/documents" className="btn btn-ghost">{g.docsLink}</a>
        </div>
        {/* Action destructive à part, sous un filet : loin du bouton Télécharger. */}
        <div className="mt-8 border-t border-line pt-4">
          <button type="button" className="btn btn-ghost text-danger" onClick={clear}>{t.clearAll}</button>
        </div>
        {saved && <p aria-hidden="true" className="mt-3 text-sm font-medium text-ink">{saved}</p>}
        <p className="mt-3 text-sm text-muted">{t.privacy}</p>
      </div>
    </>
  )
}
