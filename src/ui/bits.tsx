import type { ReactNode } from 'react'
import { LANGS, type Lang } from '../model/types'

/** Noms de langues, chacun dans sa propre langue. */
export const LANG_NAMES: Record<Lang, string> = {
  fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português', ar: 'العربية',
}

export const Heart = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="fill-accent">
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.3 5c2.1 0 3.7 1.2 5.7 3.3C14 6.2 15.6 5 17.7 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z" />
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
