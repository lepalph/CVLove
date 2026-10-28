import { useEffect, useState, type ReactNode } from 'react'
import { extra } from '../i18n/extra'
import { exportDocs } from '../model/documents'
import { LANGS, type Lang } from '../model/types'
import { useSaveStatus, useStore } from '../store'
import { logoAccent } from './lib'

/** Noms de langues, chacun dans sa propre langue. */
export const LANG_NAMES: Record<Lang, string> = {
  fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português', ar: 'العربية',
}

export const Heart = ({ color }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="fill-danger" style={color ? { fill: color } : undefined}>
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.3 5c2.1 0 3.7 1.2 5.7 3.3C14 6.2 15.6 5 17.7 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z" />
  </svg>
)

/** `accent` : couleur du document actif (éditeur). Le cœur la prend si elle ressort sur le fond, sinon il garde le rouge de la marque. */
export function Logo({ accent }: { accent?: string }) {
  const dark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  return (
    <a href="#/" className="inline-flex min-h-11 items-center gap-1.5 text-lg font-semibold tracking-tight" aria-label="CVLove">
      CVLove
      <Heart color={logoAccent(accent, dark ? '#0a0a0a' : '#fafafa')} />
    </a>
  )
}

/** Lien d'évitement : un bouton (pas une ancre, le hash sert au routage) qui met le focus sur `#main`. */
export function SkipLink() {
  const label = extra[useStore((s) => s.uiLang)].skip
  return (
    <button type="button" onClick={() => document.getElementById('main')?.focus()}
      className="sr-only rounded-ctl bg-ink px-4 py-3 text-desk focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50">
      {label}
    </button>
  )
}

/** Vrai quand la fenêtre a la largeur du mode bureau (lg, 64 rem). */
export function useWide() {
  const q = '(min-width: 64rem)'
  const [wide, setWide] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const m = matchMedia(q)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}

export const GithubIcon = () => (
  <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" className="fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
)

export function LangSelect({ label, value, onChange, langs = LANGS, wide }: { label: string; value: Lang; onChange: (l: Lang) => void; langs?: readonly Lang[]; wide?: boolean }) {
  return (
    <select aria-label={label} title={label} className={`inp ${wide ? '' : 'w-auto'}`} value={value} onChange={(e) => onChange(e.target.value as Lang)}>
      {langs.map((l) => (
        <option key={l} value={l} lang={l}>{LANG_NAMES[l]}</option>
      ))}
    </select>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export const Icon = ({ label, onClick, children, disabled }: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean }) => (
  <button type="button" className="btn btn-ghost px-0" aria-label={label} title={label} onClick={onClick} disabled={disabled}>
    {children}
  </button>
)

/** Choix exclusif en boutons (pas de <select> pour 2 à 4 options : tout se voit d'un coup d'œil). */
export function Seg<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-ctl border border-edge p-1">
      {options.map(([v, text]) => (
        <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
          className="min-h-9 flex-1 whitespace-nowrap rounded-[4px] px-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink aria-pressed:bg-ink aria-pressed:text-desk">
          {text}
        </button>
      ))}
    </div>
  )
}

/** Bandeau (role="alert") quand l'enregistrement local échoue : la saisie reste en mémoire, l'export JSON la sauve. */
export function SaveBanner() {
  const error = useSaveStatus((s) => s.error)
  const x = extra[useStore((s) => s.uiLang)]
  if (!error) return null
  const save = () => {
    const url = URL.createObjectURL(new Blob([exportDocs(useStore.getState().documents)], { type: 'application/json' }))
    Object.assign(document.createElement('a'), { href: url, download: 'cvlove-documents.json' }).click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
  return (
    <div role="alert" className="mx-auto flex w-full max-w-[75rem] flex-wrap items-center gap-3 border-b border-danger px-[var(--m)] py-3 text-sm text-danger">
      <p className="m-0 flex-1 basis-64 text-pretty">{error === 'quota' ? x.saveQuota : x.saveUnavailable}</p>
      <button type="button" className="btn" onClick={save}>{x.exportMine}</button>
    </div>
  )
}
