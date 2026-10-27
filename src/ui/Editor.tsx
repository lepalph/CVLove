import { useState } from 'react'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { pdfFileName } from '../model/cv'
import { LANGS } from '../model/types'
import { renderLazy } from '../pdf/lazy'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { useCvDoc, useStore } from '../store'
import { LangSelect, Logo } from './bits'
import { Form } from './Form'

export function Editor() {
  const { data: cv, design } = useCvDoc()
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  const t = ui[uiLang]
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [state, setState] = useState<'busy' | 'ready' | 'error'>('busy')
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    setDownloading(true)
    try {
      const bytes = await renderLazy(cv, design)
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
        <div className="a-logo flex items-center gap-3">
          <Logo />
          <a href="#/documents" className="btn btn-ghost whitespace-nowrap border-0 px-2" aria-label={v2[uiLang].docs} title={v2[uiLang].docs}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="fill-none stroke-current stroke-2 sm:hidden"><path d="M8 3h8l4 4v14H8z M4 7v14h4" strokeLinejoin="round" /></svg>
            <span className="max-sm:hidden">{v2[uiLang].docs}</span>
          </a>
        </div>
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
            <div className="min-h-[20rem] bg-white shadow-sheet" aria-label={t.tabPreview}>
              <PdfCanvas make={() => renderLazy(cv, design)} deps={[cv, design]} debounce={300} onState={setState} />
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
