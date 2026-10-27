import { useRef, useState } from 'react'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { exportDocs } from '../model/documents'
import { LANGS, type Doc } from '../model/types'
import { useStore } from '../store'
import { LangSelect, Logo } from './bits'

const download = (name: string, json: string) => {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  Object.assign(document.createElement('a'), { href: url, download: name }).click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** #/documents : liste des CV (et lettres) ; créer, ouvrir, dupliquer, renommer, supprimer, exporter / importer en JSON. */
export function Documents() {
  const { documents, activeId, uiLang, setUiLang, openDoc, createCV, duplicate, rename, remove, importDocs } = useStore()
  const t = v2[uiLang]
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const open = (id: string) => {
    openDoc(id)
    location.hash = '#/editeur'
  }
  const onImport = async (f?: File) => {
    if (!f) return
    try {
      importDocs(await f.text())
      setError('')
    } catch {
      setError(t.importError)
    }
  }
  const del = (d: Doc) => {
    if (confirm(t.deleteConfirm.replace('{name}', d.name))) remove(d.id)
  }
  const date = new Intl.DateTimeFormat(uiLang === 'ar' ? 'ar-u-nu-latn' : uiLang, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-desk">
        <nav className="mx-auto flex h-16 w-full max-w-[75rem] items-center gap-3 px-[var(--m)]">
          <Logo />
          <div className="ms-auto flex items-center gap-2">
            <a href="#/editeur" className="btn btn-ghost whitespace-nowrap border-0">{ui[uiLang].tabEdit}</a>
            <LangSelect label={ui[uiLang].uiLang} value={uiLang} onChange={setUiLang} langs={LANGS} />
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[75rem] px-[var(--m)] py-10">
        <h1 className="text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.04em]">{t.docs}</h1>
        <p className="mt-3 max-w-[34rem] text-pretty text-lg text-muted">{t.docsSub}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => open(createCV())}>{t.newCV}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { void onImport(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>{t.importFile}</button>
          <button type="button" className="btn" onClick={() => download('cvlove-documents.json', exportDocs(documents))}>{t.exportAll}</button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}

        <ul className="mt-8 list-none border-t border-line p-0" aria-label={t.docs}>
          {documents.map((d) => (
            <li key={d.id} data-doc={d.name} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4">
              <div className="min-w-[12rem] flex-1">
                {editing === d.id ? (
                  <input autoFocus aria-label={t.renameLabel} className="inp" defaultValue={d.name}
                    onBlur={(e) => { rename(d.id, e.target.value); setEditing(null) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditing(null) }} />
                ) : (
                  <p className="text-lg font-semibold tracking-tight">{d.name}</p>
                )}
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {d.kind === 'cv' ? t.kindCV : t.kindLetter} · {t.updated} {date.format(d.updatedAt)}
                  {d.id === activeId && <> · <span className="text-ink">{t.active}</span></>}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {d.kind === 'cv' && <button type="button" className="btn" aria-label={`${t.open} : ${d.name}`} onClick={() => open(d.id)}>{t.open}</button>}
                <button type="button" className="btn btn-ghost" aria-label={`${t.duplicate} : ${d.name}`} onClick={() => duplicate(d.id)}>{t.duplicate}</button>
                <button type="button" className="btn btn-ghost" aria-label={`${t.rename} : ${d.name}`} onClick={() => setEditing(d.id)}>{t.rename}</button>
                <button type="button" className="btn btn-ghost" aria-label={`${t.exportDoc} : ${d.name}`} onClick={() => download(`${d.name.replace(/[^\p{L}\p{N}]+/gu, '-')}.json`, exportDocs([d]))}>{t.exportDoc}</button>
                <button type="button" className="btn btn-ghost text-danger" aria-label={`${t.del} : ${d.name}`} onClick={() => del(d)}>{t.del}</button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
