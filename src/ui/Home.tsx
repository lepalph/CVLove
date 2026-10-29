import { Fragment, useState } from 'react'
import { isEmptyCV, modelName } from './lib'
import { fullName } from '../model/cv'
import { cvLabels } from '../i18n/labels'
import { GITHUB_URL, home } from '../i18n/home'
import { formatDate, shell } from '../i18n/shell'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { LANGS, type Lang } from '../model/types'
import { useStore } from '../store'
import { layouts, templates } from '../templates'
import { GithubIcon, LangSelect, Logo, SkipLink } from './bits'
import { useModelFilter } from './DesignPanel'
import { guidedStart } from './Guided'
import { SamplePage } from './SamplePage'

const H2 = 'text-balance text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[2rem]'
const SECTION = 'py-14 sm:py-20'
const EDITOR = '#/editeur'
// La démo du hero garde les 4 mises en page d'origine (légende « quatre mises en page ») ; le catalogue en dessous liste tout le registre.
const HOME_LAYOUTS = ['classique', 'moderne', 'minimal', 'creatif']
const homeTemplates = layouts.filter((l) => HOME_LAYOUTS.includes(l.layoutId))

export function Home() {
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  const updateDesign = useStore((s) => s.updateDesign)
  const t = home[uiLang]
  const [demo, setDemo] = useState(homeTemplates[0].id)
  const { shown, filters } = useModelFilter(true)
  // CV à reprendre : l'actif s'il est rempli, sinon le plus récemment modifié.
  const mine = useStore((s) => {
    const cvs = s.documents.filter((d) => d.kind === 'cv' && !isEmptyCV(d.data))
    return cvs.find((d) => d.id === s.activeId) ?? cvs.sort((a, b) => b.updatedAt - a.updatedAt)[0]
  })
  const sh = shell[uiLang]

  const start = (templateId: string) => {
    updateDesign({ ...templates.find((m) => m.id === templateId)?.preset, templateId })
    guidedStart.afterModel = true
    location.hash = EDITOR
  }
  const wrap = 'mx-auto w-full max-w-[75rem] px-[var(--m)]'

  return (
    <>
      <SkipLink />
      <header className="sticky top-0 z-20 border-b border-line bg-desk">
        <nav className={`${wrap} flex h-16 items-center gap-3 sm:gap-6`}>
          <Logo />
          <div className="hidden items-center gap-1 lg:flex">
            <a href="#modeles" className="btn btn-ghost border-0">{t.navModels}</a>
            <a href="#comment" className="btn btn-ghost border-0">{t.navHow}</a>
          </div>
          <div className="ms-auto flex items-center gap-2 sm:gap-3">
            <a href="#/documents" className="btn btn-ghost whitespace-nowrap border-0 px-2 sm:px-4">{v2[uiLang].docs}</a>
            <a href={GITHUB_URL} className="btn btn-ghost hidden border-0 sm:inline-flex" aria-label={t.navCode} title={t.navCode}><GithubIcon /></a>
            <LangSelect label={ui[uiLang].uiLang} value={uiLang} onChange={(l: Lang) => setUiLang(l)} langs={LANGS} />
            <a href={EDITOR} className="btn btn-primary btn-pill hidden whitespace-nowrap sm:inline-flex">{t.create}</a>
          </div>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* Trame de fond : des feuilles A4 (1:1,414) en filet, qui s'effacent vers les bords. */}
        <div className="trame">
        {mine && mine.kind === 'cv' && (
          <section aria-labelledby="resume-title" className={`${wrap} pt-8`}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card border border-edge bg-panel p-4 sm:p-5">
              <div className="min-w-0 flex-1 basis-64">
                <h2 id="resume-title" className="m-0 text-base font-semibold">{sh.resume}</h2>
                <p className="mt-1 text-pretty text-sm text-muted">
                  {sh.resumeLine.replace('{name}', fullName(mine.data) || mine.name).replace('{date}', formatDate(mine.updatedAt, uiLang))}
                  <span className="block">{sh.resumeLocal}</span>
                </p>
              </div>
              <a href={EDITOR} className="btn btn-primary" onClick={() => useStore.getState().openDoc(mine.id)}>{sh.resumeBtn}</a>
            </div>
          </section>
        )}
        <section className={`${wrap} grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16`}>
          <div>
            <h1 className="text-balance text-[2rem] font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl">
              {/* Coupure après la virgule (latine ou arabe) : text-balance seul coupait « sans / compte ». */}
              {t.heroTitle.split(/(?<=[,،])\s/).map((part, i) => (
                <Fragment key={part}>{i > 0 && ' '}<span className="block">{part}</span></Fragment>
              ))}
            </h1>
            <p className="mt-5 max-w-[34rem] text-pretty text-lg leading-relaxed text-muted">{t.heroSub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={EDITOR} className="btn btn-primary btn-pill">{t.create}</a>
              <a href={GITHUB_URL} className="btn btn-pill">{t.seeCode}</a>
            </div>
            <p className="mt-8 font-mono text-[0.8125rem] text-muted">
              {t.meta.split(' · ').map((item, i) => (
                <Fragment key={item}>{i > 0 && ' · '}<span className="whitespace-nowrap">{item}</span></Fragment>
              ))}
            </p>
          </div>

          <figure className="m-0 w-full">
            <div role="group" aria-label={t.demoLabel} className="mb-3 grid grid-cols-4 gap-1 rounded-ctl border border-edge p-1">
              {homeTemplates.map((tpl) => (
                <button key={tpl.id} type="button" aria-pressed={demo === tpl.id} onClick={() => setDemo(tpl.id)}
                  className="min-h-11 rounded-[4px] px-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink aria-pressed:bg-ink aria-pressed:text-desk">
                  {tpl.layoutName[uiLang]}
                </button>
              ))}
            </div>
            <SamplePage lang={uiLang} templateId={demo} eager />
            <figcaption className="mt-3 text-center text-sm text-muted">{t.demoCaption}</figcaption>
          </figure>
        </section>
        </div>

        <section id="comment" className={`${wrap} ${SECTION} border-t border-line`}>
          <h2 className={H2}>{t.howTitle}</h2>
          <ol className="mt-10 list-none p-0">
            {t.steps.map(([lead, body], i) => (
              <li key={lead} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line py-6 last:border-b sm:grid-cols-[4rem_minmax(0,22rem)_1fr] sm:gap-x-8 sm:py-8">
                <span className="font-mono text-sm text-muted" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">{lead}</h3>
                <p className="col-start-2 mt-2 text-pretty text-base leading-relaxed text-muted sm:col-start-3 sm:mt-0">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="modeles" className={`${wrap} ${SECTION} border-t border-line`}>
          <h2 className={H2}>{t.modelsTitle.replace('{n}', String(templates.length))}</h2>
          <div className="mt-8">{filters}</div>
          <ul className="mt-10 grid list-none grid-cols-2 gap-x-4 gap-y-8 p-0 lg:grid-cols-4 lg:gap-x-6">
            {shown.map((tpl) => {
              const name = modelName(tpl, uiLang)
              return (
                <li key={tpl.id} className="flex flex-col gap-3">
                  <SamplePage lang={uiLang} templateId={tpl.id} />
                  <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
                  <button type="button" className="btn mt-auto w-full" aria-label={`${t.useTemplate} (${name})`} onClick={() => start(tpl.id)}>{t.useTemplate}</button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className={`${wrap} ${SECTION} grid gap-6 border-t border-line md:grid-cols-2 md:gap-16`}>
          <h2 className={H2}>{t.privacyTitle}</h2>
          <div>
            <p className="max-w-[34rem] text-pretty text-lg leading-relaxed text-muted">{t.privacyText}</p>
            <a href={GITHUB_URL} className="btn btn-pill mt-6">{t.readCode}</a>
          </div>
        </section>

        <section className={`${wrap} ${SECTION} border-t border-line`}>
          <h2 className={`${H2} max-w-[28rem]`}>{t.langsTitle}</h2>
          <p className="mt-4 max-w-[34rem] text-pretty text-lg leading-relaxed text-muted">{t.langsText}</p>
          <ul className="mt-10 grid list-none grid-cols-2 gap-x-6 p-0 md:grid-cols-4">
            {LANGS.map((l) => (
              <li key={l} className="flex flex-col gap-2 border-t border-line py-5">
                <span className="font-mono text-xs uppercase text-muted" dir="ltr">{l}</span>
                <span lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'} className="self-start text-[1.75rem] font-medium leading-tight tracking-[-0.03em] sm:text-3xl">{cvLabels[l].sections.education}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${wrap} ${SECTION} grid gap-6 border-t border-line md:grid-cols-[1fr_auto] md:items-end md:gap-16`}>
          <div>
            <h2 className={H2}>{t.openTitle}</h2>
            <p className="mt-4 max-w-[34rem] text-pretty text-lg leading-relaxed text-muted">{t.openText}</p>
          </div>
          <div><a href={GITHUB_URL} className="btn btn-pill">{t.contribute}</a></div>
        </section>

        <section className={`${wrap} pb-14 sm:pb-20`}>
          <div className="flex flex-col items-start gap-6 rounded-card bg-ink p-8 text-desk sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <h2 className="max-w-[24ch] text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-4xl">{t.finalTitle}</h2>
            <a href={EDITOR} className="btn btn-pill whitespace-nowrap border-desk bg-desk text-ink hover:!bg-sunk">{t.create}</a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className={`${wrap} flex flex-wrap items-center gap-x-6 gap-y-1 py-6 text-sm text-muted`}>
          <span className="font-semibold text-ink">CVLove</span>
          <span>{t.license}</span>
          <a href={GITHUB_URL} className="inline-flex min-h-11 items-center underline underline-offset-4">{t.source}</a>
          <span>{t.noCookie}</span>
        </div>
      </footer>
    </>
  )
}
