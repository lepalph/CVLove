import { GITHUB_URL } from '../i18n/home'
import { legal } from '../i18n/legal'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { LANGS } from '../model/types'
import { useStore } from '../store'
import { LangSelect, Logo, SaveBanner, SkipLink } from './bits'

/** #/mentions : mentions légales (LCEN) et confidentialité. Texte dans i18n/legal.ts. */
export function Legal() {
  const { uiLang, setUiLang } = useStore()
  const t = legal[uiLang]
  const fill = (s: string) =>
    s.split('{repo}').flatMap((part, i) => [
      i > 0 && <a key={i} href={GITHUB_URL} className="underline underline-offset-4 [overflow-wrap:anywhere]">{GITHUB_URL}</a>,
      part.replace('{docs}', v2[uiLang].docs).replace('{wipe}', v2[uiLang].wipeAll),
    ])
  return (
    <>
      <SkipLink />
      <header className="sticky top-0 z-20 border-b border-line bg-desk">
        <nav className="mx-auto flex h-16 w-full max-w-[75rem] items-center gap-3 px-[var(--m)]">
          <Logo />
          <div className="ms-auto flex items-center gap-2">
            <LangSelect label={ui[uiLang].uiLang} value={uiLang} onChange={setUiLang} langs={LANGS} />
          </div>
        </nav>
      </header>
      <SaveBanner />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[42rem] flex-1 px-[var(--m)] py-10 outline-none">
        <h1 className="text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.04em]">{t.title}</h1>
        <p className="mt-3 text-pretty text-lg text-muted">{t.intro}</p>
        {t.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">{s.h}</h2>
            {s.p.map((p) => <p key={p} className="mt-3 text-pretty leading-relaxed text-muted [overflow-wrap:anywhere]">{fill(p)}</p>)}
          </section>
        ))}
        <p className="mt-12"><a href="#/" className="inline-flex min-h-11 items-center underline underline-offset-4">{t.back}</a></p>
      </main>
    </>
  )
}
