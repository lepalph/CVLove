import { useEffect, useState, type ReactNode } from 'react'
import { extra } from '../i18n/extra'
import { guide } from '../i18n/guide'
import { letterUi, type LetterUI } from '../i18n/letter'
import { ui } from '../i18n/ui'
import { isBlankLetter, isEmptyLetter, letterFileName, patchRecipient, patchSender, setLetterLang } from '../model/letter'
import { LANGS, type LetterDoc } from '../model/types'
import { sampleLetter } from '../model/sample'
import { previewLetterLazy, renderLetterLazy } from '../pdf/lazy'
import { useLetterDoc, useStore } from '../store'
import { getLetterLayout } from '../templates/letterTemplates'
import { Field, LangSelect, SaveBanner, SkipLink, useDownloadAlert } from './bits'
import { EdFooter, EdHeader, MobileTools, PreviewPane } from './EditorParts'
import { DesignSettings } from './DesignPanel'
import { LetterExampleTools } from './ExampleTools'
import { sampleProfileOf } from './lib'
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
  const setLetterMode = useStore((s) => s.setLetterMode)
  const mode = editorMode ?? 'full'
  const x = extra[uiLang]
  const progress = useGuidedProgress(doc.id)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [downloading, setDownloading] = useState(false)
  const [said, setSaid] = useState('')
  const layoutName = getLetterLayout(design.templateId).name[uiLang]
  const dl = useDownloadAlert(isBlankLetter(letter) ? 0 : letter) // vierge : l’alerte « vide » reste quand la langue s’aligne

  const download = async () => {
    if (downloading) return
    if (isEmptyLetter(letter)) return dl.fail('empty') // l'aperçu montre l'exemple : sans ce refus, le PDF sortirait blanc
    dl.clear()
    setSaid('') // vidée avant d'être remplie : un 2e téléchargement du même fichier est annoncé de nouveau
    setDownloading(true)
    try {
      const bytes = await renderLetterLazy(letter, design)
      const url = URL.createObjectURL(new Blob([bytes.slice()], { type: 'application/pdf' }))
      const file = letterFileName(letter)
      Object.assign(document.createElement('a'), { href: url, download: file }).click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      setSaid(x.downloaded.replace('{file}', file))
    } catch (e) {
      console.error(e)
      dl.fail('pdf')
    } finally {
      setDownloading(false)
    }
  }

  const empty = isEmptyLetter(letter)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SkipLink />
      <EdHeader doc={doc!} mode={mode} onMode={setLetterMode} tab={tab} onTab={setTab} onDownload={download} accent={design.accent} />
      <SaveBanner />
      {dl.node}
      <main id="main" tabIndex={-1} className="grid min-h-0 flex-1 outline-none lg:grid-cols-[minmax(26rem,32rem)_1fr]">
        <div className={`${tab === 'edit' ? 'block' : 'hidden'} overflow-y-auto border-line bg-panel p-[var(--m)] lg:block lg:border-e lg:p-8`}>
          <MobileTools doc={doc!} mode={mode} onMode={setLetterMode} />
          <LetterExampleTools />
          {mode === 'guided' ? <LetterGuided doc={doc} progress={progress} onDownload={download} downloading={downloading} /> : <LetterForm />}
        </div>
        <PreviewPane shown={tab === 'preview'} make={(signal) => previewLetterLazy(empty ? sampleLetter(letter.lang, sampleProfileOf(letter.sender.name)) : letter, design, signal)} deps={[letter, design]} empty={empty} sample said={said} quiet={dl.pdfFailed}
          label={x.previewAlt.replace('{model}', layoutName).replace('{who}', [letter.sender.name, letter.subject].filter(Boolean).join(', '))} />
      </main>
      <EdFooter doc={doc!} />
    </div>
  )
}

const useLetter = () => {
  const letter = useLetterDoc()!.data
  const update = useStore((s) => s.updateLetter)
  const L = letterUi[useStore((s) => s.uiLang)]
  return { letter, update, L, t: ui[useStore((s) => s.uiLang)] }
}

/** `auto` : valeur d'`autocomplete` (1.3.5), seulement pour les champs qui portent sur la personne qui écrit. */
const Text = ({ label, value, onChange, type = 'text', auto }: { label: string; value: string; onChange: (v: string) => void; type?: string; auto?: string }) => (
  <Field label={label}><input className="inp" type={type} value={value} autoComplete={auto} onChange={(e) => onChange(e.target.value)} /></Field>
)
const Area = ({ label, value, onChange, rows, hint, placeholder, auto }: { label: string; value: string; onChange: (v: string) => void; rows: number; hint?: string; placeholder?: string; auto?: string }) => (
  <Field label={label} hint={hint}><textarea className="inp" rows={rows} placeholder={placeholder} value={value} autoComplete={auto} onChange={(e) => onChange(e.target.value)} /></Field>
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
        <div className="sm:col-span-2"><Text label={L.name} value={s.name} auto="name" onChange={(v) => set({ name: v })} /></div>
        <div className="sm:col-span-2"><Text label={L.jobTitle} value={s.title} auto="organization-title" onChange={(v) => set({ title: v })} /></div>
        <Text label={t.email} value={s.email} type="email" auto="email" onChange={(v) => set({ email: v })} />
        <Text label={t.phone} value={s.phone} type="tel" auto="tel" onChange={(v) => set({ phone: v })} />
        <div className="sm:col-span-2"><Area label={L.address} rows={2} value={s.address} auto="street-address" onChange={(v) => set({ address: v })} /></div>
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
        <Area label={L.body} hint={L.bodyHint} placeholder={L.bodyPlaceholder} rows={14} value={letter.body} onChange={(v) => set({ body: v })} />
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
  const l = doc.data
  const filled = (i: number) => [!!l.sender.name.trim(), !!(l.recipient.name.trim() || l.recipient.company.trim()), !!l.subject.trim(), !!l.body.trim()][i] ?? true
  return <Steps progress={progress} names={L.steps} hints={L.hints} filled={filled}>{body}</Steps>
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
          <button type="button" className="btn btn-primary" onClick={onDownload} aria-busy={downloading}>{t.download}</button>
          <a href="#/documents" className="btn btn-ghost">{g.docsLink}</a>
        </div>
        <p className="mt-3 text-sm text-muted">{t.privacy}</p>
      </div>
    </>
  )
}
