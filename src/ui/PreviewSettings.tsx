import { useEffect, useId, useRef, useState } from 'react'
import { previewSettings } from '../i18n/previewSettings'
import { useCvDoc, useStore } from '../store'
import { templates } from '../templates'
import { DesignSettings } from './DesignPanel'
import { Field, useWide } from './bits'
import { modelName } from './lib'

/**
 * Mobile seulement : barre collée en bas de l'aperçu et tiroir des réglages qu'on veut voir changer sur la feuille
 * (modèle, couleur, police, taille du texte, « Tenir sur 1 page »). Tiroir non modal : la feuille reste visible et défilable au-dessus.
 * Échap ou « Fermer » le referme, et le focus revient au bouton d'ouverture.
 */
export function PreviewSettings({ letter }: { letter?: boolean }) {
  const wide = useWide()
  const uiLang = useStore((s) => s.uiLang)
  const t = previewSettings[uiLang]
  const { design } = useCvDoc()
  const updateDesign = useStore((s) => s.updateDesign)
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLButtonElement>(null)
  const closer = useRef<HTMLButtonElement>(null)
  const id = useId()
  const shut = () => { setOpen(false); opener.current?.focus() }
  useEffect(() => {
    if (!open) return
    closer.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); opener.current?.focus() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  if (wide) return null
  return (
    <div className="sticky bottom-0 z-20 -mx-[var(--m)] -mb-[var(--m)] mt-3 border-t border-line bg-desk px-[var(--m)] py-2">
      <button ref={opener} type="button" className="btn w-full" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={() => setOpen(true)}>{t.open}</button>
      {open && (
        <>
          <div aria-hidden="true" className="h-[42dvh]" />
          <div id={id} role="dialog" aria-label={t.title} className="fixed inset-x-0 bottom-0 z-40 max-h-[42dvh] overflow-y-auto border-t border-line bg-panel p-[var(--m)] shadow-sheet">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="m-0 text-sm font-semibold">{t.title}</p>
              <button ref={closer} type="button" className="btn btn-ghost" onClick={shut}>{t.close}</button>
            </div>
            <div className="flex flex-col gap-4">
              {!letter && (
                <Field label={t.model}>
                  <select className="inp" aria-label={t.model} value={design.templateId} onChange={(e) => { const m = templates.find((x) => x.id === e.target.value); if (m) updateDesign({ ...m.preset, templateId: m.id }) }}>
                    {templates.map((m) => <option key={m.id} value={m.id}>{modelName(m, uiLang)}</option>)}
                  </select>
                </Field>
              )}
              <DesignSettings letter={letter} quick />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
