import { useRef, useState } from 'react'
import { extra } from '../i18n/extra'
import { formatDate, importedText, shell } from '../i18n/shell'
import { letterUi } from '../i18n/letter'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { fullName } from '../model/cv'
import { MAX_IMPORT_BYTES } from '../model/sanitize'
import { exportDocs } from '../model/documents'
import { LANGS, type Doc } from '../model/types'
import { isBlankDraft, useStore, wipeStorage } from '../store'
import { LANG_NAMES, LangSelect, Logo, SaveBanner, SkipLink } from './bits'

/** Nom affiché : un nom automatique (« CV », « CV 2 », « Lettre ») est complété par la personne, pour distinguer plusieurs documents. */
const shownName = (d: Doc) => {
  const who = d.kind === 'cv' ? fullName(d.data) : d.data.sender.name.trim()
  return who && /^(CV|Lettre)( \d+)?$/.test(d.name) ? `${d.name} · ${who}` : d.name
}

const download = (name: string, json: string) => {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  Object.assign(document.createElement('a'), { href: url, download: name }).click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Ajoute les documents d'un fichier JSON, ouvre le premier et renvoie leur nombre (lève `Error('invalid')` si illisible).
 * Un brouillon vierge laisse sa place aux documents importés (voir `dropBlankDrafts`) ; un CV enregistré n'est jamais retiré.
 */
export function importAndOpen(json: string): number {
  const { importDocs, openDoc, documents } = useStore.getState()
  const known = new Set(documents.map((d) => d.id))
  const n = importDocs(json)
  const first = useStore.getState().documents.find((d) => !known.has(d.id))
  if (first) openDoc(first.id)
  return n
}

/** #/documents : liste des CV (et lettres) ; créer, ouvrir, dupliquer, renommer, supprimer, exporter / importer en JSON. */
export function Documents() {
  const { documents, activeId, uiLang, setUiLang, openDoc, createCV, createLetter, duplicate, rename, remove } = useStore()
  const t = v2[uiLang]
  const L = letterUi[uiLang]
  const cvs = documents.filter((d) => d.kind === 'cv' && !isBlankDraft(d))
  const [asking, setAsking] = useState(false)
  const [source, setSource] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [said, setSaid] = useState('') // annonce (zone role=status toujours présente)
  const done = useRef(false) // le champ de renommage a déjà été validé ou annulé
  const fileRef = useRef<HTMLInputElement>(null)

  const open = (id: string) => {
    openDoc(id)
    location.hash = useStore.getState().documents.find((d) => d.id === id)?.kind === 'letter' ? '#/lettre' : '#/editeur'
  }
  const onImport = async (f?: File) => {
    if (!f) return
    setSaid('')
    if (f.size > MAX_IMPORT_BYTES) return setErr(extra[uiLang].tooBig.replace('{mb}', String(MAX_IMPORT_BYTES / 1e6)))
    try {
      const n = importAndOpen(await f.text())
      setErr('')
      setSaid(importedText(uiLang, n))
    } catch {
      setErr(t.importError)
    }
  }
  const focusRename = (id: string) => requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-rename="${id}"]`)?.focus())
  const finishRename = (id: string, value: string | null) => {
    if (done.current) return
    done.current = true
    if (value !== null) rename(id, value)
    setEditing(null)
  }
  const dup = (id: string) => {
    duplicate(id)
    const s = useStore.getState()
    setSaid(shell[uiLang].duplicated.replace('{name}', s.documents.find((d) => d.id === s.activeId)?.name ?? ''))
  }
  const del = (d: Doc) => {
    if (!confirm(t.deleteConfirm.replace('{name}', d.name))) return
    remove(d.id)
    setSaid('')
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#main h1')?.focus()) // la ligne disparaît avec son bouton
  }

  return (
    <>
      <SkipLink />
      <header className="sticky top-0 z-20 border-b border-line bg-desk">
        <nav className="mx-auto flex h-16 w-full max-w-[75rem] items-center gap-3 px-[var(--m)]">
          <Logo />
          <div className="ms-auto flex items-center gap-2">
            <a href="#/editeur" className="btn btn-ghost whitespace-nowrap border-0">{ui[uiLang].tabEdit}</a>
            <LangSelect label={ui[uiLang].uiLang} value={uiLang} onChange={setUiLang} langs={LANGS} />
          </div>
        </nav>
      </header>
      <SaveBanner />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[75rem] px-[var(--m)] py-10 outline-none">
        <h1 tabIndex={-1} className="text-balance text-[2rem] font-semibold outline-none leading-[1.1] tracking-[-0.04em]">{t.docs}</h1>
        <p className="mt-3 max-w-[34rem] text-pretty text-lg text-muted">{t.docsSub}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => open(createCV())}>{t.newCV}</button>
          <button type="button" className="btn" aria-expanded={asking} onClick={() => { setAsking(!asking); setSource(cvs[0]?.id ?? '') }}>{L.newLetter}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { void onImport(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>{t.importFile}</button>
          <button type="button" className="btn" onClick={() => download('cvlove-documents.json', exportDocs(documents.filter((d) => !isBlankDraft(d))))}>{t.exportAll}</button>
        </div>
        {asking && (
          <form className="mt-4 flex max-w-[34rem] flex-wrap items-end gap-2 rounded-card border border-line p-4" aria-label={L.newLetter}
            onSubmit={(e) => { e.preventDefault(); open(createLetter(source || undefined)) }}>
            <label className="block min-w-[12rem] flex-1">
              <span className="mb-1 block text-sm font-medium">{L.source}</span>
              <select autoFocus className="inp" value={source} onChange={(e) => setSource(e.target.value)}>
                {cvs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                <option value="">{L.scratch}</option>
              </select>
            </label>
            <button type="submit" className="btn btn-primary">{L.create}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setAsking(false)}>{L.cancel}</button>
          </form>
        )}
        <p role="status" className="mt-3 text-sm text-muted empty:hidden">{said}</p>
        {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}

        <ul className="mt-8 list-none border-t border-line p-0" aria-label={t.docs}>
          {documents.filter((d) => !isBlankDraft(d)).map((d) => ( // brouillon vierge : rien à lister
            <li key={d.id} data-doc={d.name} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4">
              <div className="min-w-[12rem] flex-1">
                {editing === d.id ? (
                  <input autoFocus aria-label={t.renameLabel} className="inp" defaultValue={d.name}
                    onBlur={(e) => finishRename(d.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { finishRename(d.id, e.currentTarget.value); focusRename(d.id) }
                      if (e.key === 'Escape') { finishRename(d.id, null); focusRename(d.id) }
                    }} />
                ) : (
                  <p className="text-lg font-semibold tracking-tight">{shownName(d)}</p>
                )}
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {d.kind === 'cv' ? t.kindCV : t.kindLetter} · {LANG_NAMES[d.data.lang]} · {t.updated} {formatDate(d.updatedAt, uiLang)}
                  {d.id === activeId && <> · <span className="text-ink">{t.active}</span></>}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <button type="button" className="btn" aria-label={`${t.open} : ${d.name}`} onClick={() => open(d.id)}>{t.open}</button>
                <button type="button" className="btn btn-ghost" aria-label={`${t.duplicate} : ${d.name}`} onClick={() => dup(d.id)}>{t.duplicate}</button>
                <button type="button" className="btn btn-ghost" aria-label={`${t.rename} : ${d.name}`} data-rename={d.id} onClick={() => { done.current = false; setEditing(d.id) }}>{t.rename}</button>
                <button type="button" className="btn btn-ghost" aria-label={`${ui[uiLang].exportJson} : ${d.name}`} onClick={() => download(`${d.name.replace(/[^\p{L}\p{N}]+/gu, '-')}.json`, exportDocs([d]))}>{ui[uiLang].exportJson}</button>
                <button type="button" className="btn btn-ghost text-danger" aria-label={`${t.del} : ${d.name}`} onClick={() => del(d)}>{t.del}</button>
              </div>
            </li>
          ))}
        </ul>
        {/* Poste partagé : tout retirer d'un coup (la copie de secours `cvlove:corrupt` comprise), après avoir pu exporter. */}
        <button type="button" className="btn btn-ghost mt-8 text-danger" onClick={() => { if (confirm(t.wipeConfirm)) { wipeStorage(); location.reload() } }}>{t.wipeAll}</button>
      </main>
    </>
  )
}
