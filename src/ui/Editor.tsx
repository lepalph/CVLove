import { useEffect, useRef, useState } from 'react'
import { extra } from '../i18n/extra'
import { tips } from '../i18n/tips'
import { fullName, pdfFileName } from '../model/cv'
import { renderLazy } from '../pdf/lazy'
import { useCvDoc, useStore } from '../store'
import { getTemplate } from '../templates'
import { ACCENTS } from '../templates/types'
import { SaveBanner, SkipLink } from './bits'
import { EdFooter, EdHeader, MobileTools, PreviewPane } from './EditorParts'
import { ExampleTools } from './ExampleTools'
import { Form } from './Form'
import { Guided, useGuidedProgress } from './Guided'
import { isEmptyCV, modelName } from './lib'
import { sampleCV } from '../model/sample'

export function Editor() {
  const doc = useCvDoc()
  const { data: cv, design, editorMode } = doc
  const setEditorMode = useStore((s) => s.setEditorMode)
  const mode = editorMode ?? 'full' // documents migrés : complet
  const progress = useGuidedProgress()
  const uiLang = useStore((s) => s.uiLang)
  const x = extra[uiLang]
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [downloading, setDownloading] = useState(false)
  const [said, setSaid] = useState('')
  const [saved, setSaved] = useState('') // confirmation visible du téléchargement, quelques secondes
  const m = getTemplate(design.templateId)
  const mName = modelName(m, uiLang)

  // Annonce (zone role=status) du modèle ou de la couleur qui vient de changer ; la valeur d'arrivée n'est pas annoncée.
  const prev = useRef({ id: design.templateId, accent: design.accent })
  useEffect(() => {
    const p = prev.current
    if (p.id !== design.templateId) setSaid(x.modelApplied.replace('{name}', mName))
    else if (p.accent !== design.accent) setSaid(x.colorApplied.replace('{name}', x.colors[ACCENTS.indexOf(design.accent as never)] ?? design.accent))
    prev.current = { id: design.templateId, accent: design.accent }
  }, [design.templateId, design.accent, mName, x])

  useEffect(() => {
    if (!saved) return
    const id = setTimeout(() => setSaved(''), 6000)
    return () => clearTimeout(id)
  }, [saved])

  const download = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const bytes = await renderLazy(cv, design)
      const url = URL.createObjectURL(new Blob([bytes.slice()], { type: 'application/pdf' }))
      const file = pdfFileName(cv)
      const a = Object.assign(document.createElement('a'), { href: url, download: file })
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      setSaid(x.downloaded.replace('{file}', file))
      setSaved(tips[uiLang].saved.replace('{file}', file))
    } finally {
      setDownloading(false)
    }
  }

  const who = [fullName(cv), cv.personal.title].filter(Boolean).join(', ')
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SkipLink />
      <EdHeader doc={doc} mode={mode} onMode={setEditorMode} tab={tab} onTab={setTab} onDownload={download} accent={design.accent} note={saved} />
      <SaveBanner />
      <main id="main" tabIndex={-1} className="grid min-h-0 flex-1 outline-none lg:grid-cols-[minmax(26rem,32rem)_1fr]">
        <div className={`${tab === 'edit' ? 'block' : 'hidden'} overflow-y-auto border-line bg-panel p-[var(--m)] lg:block lg:border-e lg:p-8`}>
          <MobileTools doc={doc} mode={mode} onMode={setEditorMode} />
          <ExampleTools />
          {mode === 'guided' ? <Guided progress={progress} onDownload={download} downloading={downloading} saved={saved} /> : <Form />}
        </div>
        <PreviewPane shown={tab === 'preview'} make={() => renderLazy(isEmptyCV(cv) ? sampleCV(cv.lang) : cv, design)} deps={[cv, design]} empty={isEmptyCV(cv)} sample said={said}
          label={x.previewAlt.replace('{model}', mName).replace('{who}', who)} />
      </main>
      <EdFooter />
    </div>
  )
}
