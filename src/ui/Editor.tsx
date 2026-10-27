import { useState } from 'react'
import { ui } from '../i18n/ui'
import { pdfFileName } from '../model/cv'
import { LANGS } from '../model/types'
import { renderLazy } from '../pdf/lazy'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { useStore } from '../store'
import { templates } from '../templates'
import { LangSelect, Logo } from './bits'
import { Form } from './Form'
import { SamplePage } from './SamplePage'

export function Editor() {
  const cv = useStore((s) => s.cv)
  const update = useStore((s) => s.update)
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  const t = ui[uiLang]
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [state, setState] = useState<'busy' | 'ready' | 'error'>('busy')
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    setDownloading(true)
    try {
      const bytes = await renderLazy(cv)
      const url = URL.createObjectURL(new Blob([bytes.slice()], { type: 'application/pdf' }))
      const a = Object.assign(document.createElement('a'), { href: url, download: pdfFileName(cv) })
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="edbar sticky top-0 z-20 border-b border-line bg-desk px-[var(--m)] py-2">
        <div className="a-logo"><Logo /></div>
        <div role="tablist" className="a-tabs flex rounded-ctl border border-edge p-0.5 lg:hidden">
          {(['edit', 'preview'] as const).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className="min-h-10 flex-1 rounded-[4px] px-3 text-sm font-medium text-muted transition-colors duration-150 aria-selected:bg-ink aria-selected:text-desk">
              {k === 'edit' ? t.tabEdit : t.tabPreview}
            </button>
          ))}
        </div>
        <div className="a-lang"><LangSelect label={t.uiLang} value={uiLang} onChange={setUiLang} langs={LANGS} /></div>
        <button type="button" className="a-dl btn btn-primary whitespace-nowrap" onClick={download} disabled={downloading}>{t.download}</button>
      </header>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(26rem,32rem)_1fr]">
        <div className={`${tab === 'edit' ? 'block' : 'hidden'} overflow-y-auto border-line bg-panel p-[var(--m)] lg:block lg:h-[calc(100dvh-4.5rem)] lg:border-e lg:p-8`}>
          <Form />
        </div>
        <div className={`${tab === 'preview' ? 'block' : 'hidden'} overflow-y-auto p-[var(--m)] lg:block lg:h-[calc(100dvh-4.5rem)] lg:p-8`}>
          <div className="relative mx-auto w-full max-w-[46rem]">
            <div role="group" aria-label={t.template}>
              <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted">{t.template}</p>
              <div className="mb-6 grid max-w-[34rem] grid-cols-4 gap-3">
                {templates.map((tpl) => {
                  const on = cv.templateId === tpl.id
                  return (
                    <button key={tpl.id} type="button" aria-pressed={on} onClick={() => update((c) => ({ ...c, templateId: tpl.id }))}
                      className="group flex min-h-11 flex-col gap-2 rounded-[4px] bg-transparent p-0 text-start">
                      <SamplePage lang={cv.lang} templateId={tpl.id} accent={cv.accent}
                        className="!shadow-none outline outline-1 -outline-offset-1 outline-edge transition-shadow duration-150 group-hover:outline-faint group-aria-pressed:!outline-2 group-aria-pressed:outline-ink" />
                      <span className={`text-sm ${on ? 'font-semibold text-ink' : 'font-medium text-muted'}`}>{tpl.name[uiLang]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="min-h-[20rem] bg-white shadow-sheet" aria-label={t.tabPreview}>
              <PdfCanvas make={() => renderLazy(cv)} deps={[cv]} debounce={300} onState={setState} />
            </div>
            <p role="status" className="mt-3 text-center text-sm text-muted">
              {state === 'busy' ? t.previewBusy : state === 'error' ? t.previewError : ' '}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
