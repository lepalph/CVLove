import { useState } from 'react'
import { ui } from '../i18n/ui'
import { pdfFileName } from '../model/cv'
import { renderLazy } from '../pdf/lazy'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { useStore } from '../store'
import { Form } from './Form'

export function Editor() {
  const cv = useStore((s) => s.cv)
  const t = ui[useStore((s) => s.uiLang)]
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
      <div className="flex items-center justify-between gap-3 border-b border-line bg-panel px-4 py-2 sm:px-6">
        <a href="#/" className="btn btn-ghost px-2" aria-label={t.back}><span className="inline-block rtl:-scale-x-100">←</span><span className="hidden sm:inline">{t.back}</span></a>
        <div role="tablist" className="flex rounded-[8px] border border-line p-0.5 lg:hidden">
          {(['edit', 'preview'] as const).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`min-h-10 rounded-[6px] px-3 text-sm font-semibold transition-colors duration-150 ${tab === k ? 'bg-accent-deep text-white' : 'text-muted'}`}>
              {k === 'edit' ? t.tabEdit : t.tabPreview}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary whitespace-nowrap" onClick={download} disabled={downloading}>{t.download}</button>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(26rem,32rem)_1fr]">
        <div className={`${tab === 'edit' ? 'block' : 'hidden'} overflow-y-auto border-line bg-panel p-4 sm:p-6 lg:block lg:h-[calc(100dvh-7.5rem)] lg:border-e`}>
          <Form />
        </div>
        <div className={`${tab === 'preview' ? 'block' : 'hidden'} overflow-y-auto p-4 sm:p-8 lg:block lg:h-[calc(100dvh-7.5rem)]`}>
          <div className="relative mx-auto w-full max-w-[46rem]">
            <div className="min-h-[20rem] bg-white shadow-sheet" aria-label={t.tabPreview}>
              <PdfCanvas make={() => renderLazy(cv)} deps={[cv]} debounce={300} onState={setState} />
            </div>
            <p role="status" className="mt-3 text-center text-sm text-muted">
              {state === 'busy' ? t.previewBusy : state === 'error' ? t.previewError : ' '}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
