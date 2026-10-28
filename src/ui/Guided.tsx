import { useEffect, useRef, useState, type ReactNode } from 'react'
import { sectionTitle, cvLabels } from '../i18n/labels'
import { guide } from '../i18n/guide'
import { ui } from '../i18n/ui'
import { fullName, visibleSections } from '../model/cv'
import { useCvDoc, useStore } from '../store'
import { getTemplate } from '../templates'
import { LANG_NAMES } from './bits'
import { DesignSettings, ModelGallery } from './DesignPanel'
import { exportJson, LanguageCard, PersonalCard, SectionsCard } from './Form'

/** Ordre des étapes ; `guide.steps` et `guide.hints` suivent le même ordre. */
const STEPS = ['model', 'identity', 'profile', 'experience', 'education', 'skills', 'others', 'design', 'download'] as const
const LAST = STEPS.length - 1

const fill = (text: string, n: number) => text.replace('{n}', String(n)).replace('{total}', String(STEPS.length))

/** Étape en cours et étapes faites, gardées par l'éditeur pour survivre à la bascule Guidé / Complet (repart de zéro si le document change). */
export function useGuidedProgress() {
  const docId = useCvDoc().id
  const [p, setP] = useState({ docId, i: 0, done: new Set<number>() })
  return p.docId === docId ? { p, setP } : { p: { docId, i: 0, done: new Set<number>() }, setP }
}
export type GuidedProgress = ReturnType<typeof useGuidedProgress>

/** Mode guidé : une étape à la fois, qui réutilise les cartes du formulaire complet. L'aperçu reste dans l'éditeur. */
export function Guided({ progress, onDownload, downloading }: { progress: GuidedProgress; onDownload: () => void; downloading: boolean }) {
  const uiLang = useStore((s) => s.uiLang)
  const g = guide[uiLang]
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
    top.current?.scrollIntoView({ block: 'start' })
  }, [i])

  const next = () => setP({ ...p, i: i + 1, done: new Set(done).add(i) })
  const step = STEPS[i]

  return (
    <div ref={top} className="flex scroll-mt-44 flex-col gap-6 lg:scroll-mt-0">
      <nav aria-label={g.stepsLabel} className="flex items-center gap-3 sm:hidden">
        <span className="whitespace-nowrap font-mono text-sm text-muted">{fill(g.stepOf, i + 1)}</span>
        <select aria-label={g.stepsLabel} className="inp" value={i} onChange={(e) => setI(+e.target.value)}>
          {g.steps.map((name, k) => <option key={name} value={k}>{k + 1}. {name}{done.has(k) && k !== i ? ` (${g.stepDone})` : ''}</option>)}
        </select>
      </nav>
      <nav aria-label={g.stepsLabel} className="max-sm:hidden">
        <ol className="m-0 flex list-none justify-between gap-1 p-0">
          {g.steps.map((name, k) => {
            const isDone = done.has(k) && k !== i
            return (
              <li key={name}>
                <button type="button" aria-current={k === i ? 'step' : undefined} aria-label={isDone ? `${name} (${g.stepDone})` : name} title={name} onClick={() => setI(k)}
                  className={`grid size-10 place-items-center rounded-full border text-sm font-medium transition-colors duration-150 ${
                    k === i ? 'border-ink bg-ink text-desk' : isDone ? 'border-ink text-ink hover:bg-sunk' : 'border-edge text-muted hover:border-faint hover:text-ink'}`}>
                  {isDone ? <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="fill-none stroke-current stroke-2"><path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg> : k + 1}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <section aria-labelledby="step-title" className="flex flex-col gap-5">
        <header>
          <p className="max-sm:hidden font-mono text-xs uppercase tracking-wide text-muted">{fill(g.stepOf, i + 1)}</p>
          <h2 id="step-title" ref={head} tabIndex={-1} className="mt-1 text-xl font-semibold tracking-tight outline-none">{g.steps[i]}</h2>
          <p className="mt-1 text-pretty text-base text-muted">{g.hints[i]}</p>
        </header>
        <StepBody step={step} onDownload={onDownload} downloading={downloading} />
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

function StepBody({ step, onDownload, downloading }: { step: (typeof STEPS)[number]; onDownload: () => void; downloading: boolean }): ReactNode {
  switch (step) {
    case 'model': return <ModelGallery tall />
    case 'identity': return <><LanguageCard /><PersonalCard /></>
    case 'profile': return <SectionsCard only={['profile']} add={['profile']} title={false} />
    case 'experience': return <SectionsCard only={['experience']} add={['experience']} title={false} />
    case 'education': return <SectionsCard only={['education']} add={['education']} title={false} />
    case 'skills': return <SectionsCard only={['skills', 'languages']} add={['skills', 'languages']} title={false} />
    case 'others': return <SectionsCard only={['projects', 'interests', 'custom']} title={false} />
    case 'design': return <DesignSettings />
    case 'download': return <Finish onDownload={onDownload} downloading={downloading} />
  }
}

function Finish({ onDownload, downloading }: { onDownload: () => void; downloading: boolean }) {
  const doc = useCvDoc()
  const uiLang = useStore((s) => s.uiLang)
  const g = guide[uiLang]
  const t = ui[uiLang]
  const { data: cv, design } = doc
  const m = getTemplate(design.templateId)
  const labels = cvLabels[cv.lang]
  const rows: [string, string][] = [
    [t.template, `${m.layoutName[uiLang]} · ${m.styleName}`],
    [t.cvLang, LANG_NAMES[cv.lang]],
    ...visibleSections(cv).map((s): [string, string] => [sectionTitle(s, labels), String(s.items.length)]),
  ]
  return (
    <>
      <div>
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
          <button type="button" className="btn btn-primary" onClick={onDownload} disabled={downloading}>{t.download}</button>
          <button type="button" className="btn" onClick={() => exportJson(doc)}>{t.exportJson}</button>
          <a href="#/documents" className="btn btn-ghost">{g.docsLink}</a>
        </div>
        <p className="mt-3 text-sm text-muted">{t.privacy}</p>
      </div>
    </>
  )
}
