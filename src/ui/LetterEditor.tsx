import { useEffect, useState, type ReactNode } from 'react'
import { guide } from '../i18n/guide'
import { letterUi, type LetterUI } from '../i18n/letter'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { letterFileName, patchRecipient, patchSender, setLetterLang } from '../model/letter'
import { LANGS, type LetterDoc } from '../model/types'
import { renderLetterLazy } from '../pdf/lazy'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { useLetterDoc, useStore } from '../store'
import { getLetterLayout } from '../templates/letterTemplates'
import { Field, LangSelect, Logo, Seg } from './bits'
import { DesignSettings } from './DesignPanel'
import { Card } from './Form'
import { Steps, useGuidedProgress } from './Guided'

/** #/lettre : éditeur de la lettre active (les deux modes comme le CV), aperçu PDF live à droite. Sans lettre, retour à Mes documents. */
export function LetterEditor() {
  const doc = useLetterDoc()
  useEffect(() => { if (!doc) location.hash = '#/documents' }, [doc])
  return doc ? <LetterEditorFor doc={doc} /> : null
}

function LetterEditorFor({ doc }: { doc: LetterDoc }) {
  const { data: letter, design, editorMode } = doc
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  const setLetterMode = useStore((s) => s.setLetterMode)
  const mode = editorMode ?? 'full'
  const g = guide[uiLang]
  const t = ui[uiLang]
  const progress = useGuidedProgress(doc.id)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [state, setState] = useState<'busy' | 'ready' | 'error'>('busy')
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    setDownloading(true)
    try {
      const bytes = await renderLetterLazy(letter, design)
      const url = URL.createObjectURL(new Blob([bytes.slice()], { type: 'application/pdf' }))
      Object.assign(document.createElement('a'), { href: url, download: letterFileName(letter) }).click()
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
        <div className="a-mode">
          <Seg label={g.mode} value={mode} onChange={setLetterMode} options={[['guided', g.guided], ['full', g.full]]} />
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
          {mode === 'guided' ? <LetterGuided doc={doc} progress={progress} onDownload={download} downloading={downloading} /> : <LetterForm />}
        </div>
        <div className={`${tab === 'preview' ? 'block' : 'hidden'} overflow-y-auto p-[var(--m)] lg:block lg:h-[calc(100dvh-4.5rem)] lg:p-8`}>
          <div className="relative mx-auto w-full max-w-[46rem]">
            <div className="min-h-[20rem] bg-white shadow-sheet" aria-label={t.tabPreview}>
              <PdfCanvas make={() => renderLetterLazy(letter, design)} deps={[letter, design]} debounce={300} onState={setState} />
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

const useLetter = () => {
  const letter = useLetterDoc()!.data
  const update = useStore((s) => s.updateLetter)
  const L = letterUi[useStore((s) => s.uiLang)]
  return { letter, update, L, t: ui[useStore((s) => s.uiLang)] }
}

const Text = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <Field label={label}><input className="inp" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></Field>
)
const Area = ({ label, value, onChange, rows, hint }: { label: string; value: string; onChange: (v: string) => void; rows: number; hint?: string }) => (
  <Field label={label} hint={hint}><textarea className="inp" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /></Field>
)

function LangCard() {
  const { letter, update, L } = useLetter()
  return (
    <Card>
      <Field label={L.letterLang}>
        <LangSelect wide label={L.letterLang} value={letter.lang} langs={LANGS} onChange={(l) => update((x) => setLetterLang(x, l))} />
      </Field>
    </Card>
  )
}

function SenderCard({ title }: { title?: string }) {
  const { letter, update, L, t } = useLetter()
  const s = letter.sender
  const set = (p: Partial<typeof s>) => update((l) => patchSender(l, p))
  return (
    <Card title={title}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Text label={L.name} value={s.name} onChange={(v) => set({ name: v })} /></div>
        <div className="sm:col-span-2"><Text label={L.jobTitle} value={s.title} onChange={(v) => set({ title: v })} /></div>
        <Text label={t.email} value={s.email} type="email" onChange={(v) => set({ email: v })} />
        <Text label={t.phone} value={s.phone} type="tel" onChange={(v) => set({ phone: v })} />
        <div className="sm:col-span-2"><Area label={L.address} rows={2} value={s.address} onChange={(v) => set({ address: v })} /></div>
      </div>
    </Card>
  )
}

function RecipientCard({ title }: { title?: string }) {
  const { letter, update, L } = useLetter()
  const r = letter.recipient
  const set = (p: Partial<typeof r>) => update((l) => patchRecipient(l, p))
  return (
    <Card title={title}>
      <div className="grid gap-3">
        <Text label={L.recName} value={r.name} onChange={(v) => set({ name: v })} />
        <Text label={L.company} value={r.company} onChange={(v) => set({ company: v })} />
        <Area label={L.address} rows={2} value={r.address} onChange={(v) => set({ address: v })} />
      </div>
    </Card>
  )
}

function SubjectCard({ title }: { title?: string }) {
  const { letter, update, L } = useLetter()
  const set = (p: Partial<typeof letter>) => update((l) => ({ ...l, ...p }))
  return (
    <Card title={title}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Text label={L.place} value={letter.place} onChange={(v) => set({ place: v })} />
        <Text label={L.date} type="date" value={letter.date} onChange={(v) => set({ date: v })} />
        <div className="sm:col-span-2"><Text label={L.subject} value={letter.subject} onChange={(v) => set({ subject: v })} /></div>
        <div className="sm:col-span-2"><Text label={L.salutation} value={letter.salutation} onChange={(v) => set({ salutation: v })} /></div>
      </div>
    </Card>
  )
}

function BodyCard({ title }: { title?: string }) {
  const { letter, update, L } = useLetter()
  const set = (p: Partial<typeof letter>) => update((l) => ({ ...l, ...p }))
  return (
    <Card title={title}>
      <div className="grid gap-3">
        <Area label={L.body} hint={L.bodyHint} rows={14} value={letter.body} onChange={(v) => set({ body: v })} />
        <Area label={L.closing} rows={2} value={letter.closing} onChange={(v) => set({ closing: v })} />
        <Text label={L.signature} value={letter.signature} onChange={(v) => set({ signature: v })} />
      </div>
    </Card>
  )
}

/** Mode complet : tout sur une page. */
function LetterForm() {
  const uiLang = useStore((s) => s.uiLang)
  const L = letterUi[uiLang]
  return (
    <div className="flex flex-col gap-6">
      <LangCard />
      <SenderCard title={L.steps[0]} />
      <RecipientCard title={L.steps[1]} />
      <SubjectCard title={L.steps[2]} />
      <BodyCard title={L.steps[3]} />
      <Card title={L.steps[4]}><DesignSettings letter /></Card>
    </div>
  )
}

/** Mode guidé : Expéditeur, Destinataire, Objet, Corps, Design, Télécharger. */
function LetterGuided({ doc, progress, onDownload, downloading }: { doc: LetterDoc; progress: ReturnType<typeof useGuidedProgress>; onDownload: () => void; downloading: boolean }) {
  const L = letterUi[useStore((s) => s.uiLang)]
  const body = (i: number): ReactNode => {
    switch (i) {
      case 0: return <><LangCard /><SenderCard /></>
      case 1: return <RecipientCard />
      case 2: return <SubjectCard />
      case 3: return <BodyCard />
      case 4: return <DesignSettings letter />
      default: return <Finish doc={doc} L={L} onDownload={onDownload} downloading={downloading} />
    }
  }
  return <Steps progress={progress} names={L.steps} hints={L.hints}>{body}</Steps>
}

function Finish({ doc, L, onDownload, downloading }: { doc: LetterDoc; L: LetterUI; onDownload: () => void; downloading: boolean }) {
  const uiLang = useStore((s) => s.uiLang)
  const g = guide[uiLang]
  const t = ui[uiLang]
  const { data: l, design } = doc
  const rows: [string, string][] = [
    [L.layout, getLetterLayout(design.templateId).name[uiLang]],
    [L.recName, [l.recipient.name, l.recipient.company].filter(Boolean).join(', ') || '—'],
    [L.subject, l.subject || '—'],
  ]
  return (
    <>
      <div>
        <h3 className="text-base font-semibold">{g.recap}</h3>
        <p className="mt-1 text-lg font-medium">{l.sender.name || '—'}</p>
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
        <p className="text-pretty text-sm text-muted">{L.readyText}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" onClick={onDownload} disabled={downloading}>{t.download}</button>
          <a href="#/documents" className="btn btn-ghost">{g.docsLink}</a>
        </div>
        <p className="mt-3 text-sm text-muted">{t.privacy}</p>
      </div>
    </>
  )
}
