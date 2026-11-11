import { useId, useMemo, useState } from 'react'
import { modelName } from './lib'
import { extra } from '../i18n/extra'
import { filtersText } from '../i18n/filters'
import { fitPageText } from '../i18n/fitpage'
import { letterUi } from '../i18n/letter'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { FONT_PAIR_DEFS } from '../pdf/fontPairs'
import { usePreviewPages } from '../pdf/pageCount'
import { FONT_PAIRS, type Design } from '../model/types'
import { isRtl } from '../model/dates'
import { useCvDoc, useLetterDoc, useStore } from '../store'
import { templates } from '../templates'
import { letterLayouts } from '../templates/letterTemplates'
import { ACCENTS, CATEGORIES, type Category } from '../templates/types'
import { Field, Seg } from './bits'
import { SamplePage } from './SamplePage'

type Cols = 'all' | '1' | '2'
type Photo = 'all' | 'yes' | 'no'

/** Filtres du catalogue (catégorie, colonnes, photo) : `shown` = modèles retenus, `filters` = les contrôles. Partagé par l'éditeur et l'accueil. */
export function useModelFilter(wide?: boolean) {
  const t = v2[useStore((s) => s.uiLang)]
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [cols, setCols] = useState<Cols>('all')
  const [photo, setPhoto] = useState<Photo>('all')
  const shown = useMemo(
    () => templates.filter((m) => (cat === 'all' || m.category === cat) && (cols === 'all' || String(m.columns) === cols) && (photo === 'all' || m.photo === (photo === 'yes'))),
    [cat, cols, photo],
  )
  const [open, setOpen] = useState(false)
  const id = useId()
  const ft = filtersText[useStore((s) => s.uiLang)]
  const controls = (
    <div id={id} className="flex flex-col gap-3">
      <Seg label={t.category} value={cat} onChange={setCat}
        options={[['all', t.all], ...CATEGORIES.map((c) => [c, t.cats[c]] as const)]} />
      <div className={`grid gap-3 ${wide ? 'sm:grid-cols-2' : ''}`}>
        <Seg label={t.columns} value={cols} onChange={setCols} options={[['all', t.all], ['1', t.oneCol], ['2', t.twoCols]]} />
        <Seg label={t.photoFilter} value={photo} onChange={setPhoto} options={[['all', t.all], ['yes', t.withPhoto], ['no', t.withoutPhoto]]} />
      </div>
    </div>
  )
  const none = shown.length === 0 && <p className="text-sm text-muted">{t.noModel}</p>
  // Accueil : tout reste ouvert. Éditeur : filtres repliés derrière un bouton, avec le décompte des modèles.
  const filters = wide ? <>{controls}{none}</> : (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="btn btn-ghost -ms-3" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{ft.filters}</button>
        <p role="status" className="m-0 text-sm text-muted">{ft.count.replace('{n}', String(shown.length)).replace('{total}', String(templates.length))}</p>
      </div>
      <div hidden={!open}>{controls}</div>
      {none}
    </div>
  )
  return { shown, filters }
}

/** Modèles : filtres + vignettes (vrais rendus). `tall` = sans hauteur maximale (étape « Modèle » du mode guidé). */
export function ModelGallery({ tall }: { tall?: boolean }) {
  const { data: cv, design } = useCvDoc()
  const updateDesign = useStore((s) => s.updateDesign)
  const uiLang = useStore((s) => s.uiLang)
  const t = v2[uiLang]
  const { shown, filters } = useModelFilter()
  const rtl = isRtl(uiLang)
  // Une seule tabulation pour toute la grille (le modèle choisi, sinon le premier) ; les flèches déplacent le focus, Entrée ou Espace choisit.
  const stop = shown.some((m) => m.id === design.templateId) ? design.templateId : shown[0]?.id
  const onKeys = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 3, ArrowUp: -3 }[e.key]
    if (!step) return
    const btns = [...e.currentTarget.querySelectorAll('button')]
    const to = btns[btns.indexOf(document.activeElement as HTMLButtonElement) + step]
    if (to) { e.preventDefault(); to.focus() }
  }
  return (
    <div className="flex flex-col gap-3" role="group" aria-label={t.models}>
      <p className="font-mono text-xs uppercase tracking-wide text-muted">{t.models}</p>
      {filters}
      <ul onKeyDown={onKeys} className={`m-0 grid list-none grid-cols-3 gap-3 p-1 ${tall ? '' : 'max-h-[28rem] overflow-y-auto'}`}>
        {shown.map((m) => {
          const on = design.templateId === m.id
          const name = modelName(m, uiLang)
          return (
            <li key={m.id}>
              <button type="button" aria-pressed={on} aria-label={name} tabIndex={m.id === stop ? 0 : -1} onClick={() => updateDesign({ ...m.preset, templateId: m.id })}
                className="group flex w-full flex-col gap-1.5 rounded-[4px] bg-transparent p-0 text-start">
                <SamplePage lang={cv.lang} templateId={m.id} custom={design.custom}
                  className="!shadow-none outline outline-1 -outline-offset-1 outline-edge transition-shadow duration-150 group-hover:outline-faint group-aria-pressed:!outline-2 group-aria-pressed:outline-ink" />
                <span className={`text-xs leading-tight ${on ? 'font-semibold text-ink' : 'text-muted'}`}>{name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Panneau Design complet (mode complet) : modèles + réglages. */
export function DesignPanel() {
  return (
    <div className="flex flex-col gap-5">
      <ModelGallery />
      <DesignSettings />
    </div>
  )
}

/** Réglages du document actif : couleur, police, taille, interligne, marges, format, photo, niveaux. `letter` : ceux de la lettre (mise en page au lieu de photo et niveaux). */
export function DesignSettings({ letter }: { letter?: boolean }) {
  const cvDesign = useCvDoc().design
  const letterDesign = useLetterDoc()?.design
  const design = (letter && letterDesign) || cvDesign
  const updateDesign = useStore((s) => (letter ? s.updateLetterDesign : s.updateDesign))
  const uiLang = useStore((s) => s.uiLang)
  const t = v2[uiLang]
  const names = extra[uiLang].colors
  const set = <K extends keyof Design>(k: K, v: Design[K]) => updateDesign({ [k]: v })
  const pages = usePreviewPages()
  const ft = fitPageText[uiLang]

  return (
    <div className="flex flex-col gap-5">
      {letter && (
        <div><p className="mb-1 text-sm font-medium">{letterUi[uiLang].layout}</p>
          <Seg label={letterUi[uiLang].layout} value={design.templateId} onChange={(v) => set('templateId', v)} options={letterLayouts.map((l) => [l.id, l.name[uiLang]] as const)} /></div>
      )}
      <fieldset>
        <legend className="mb-1 text-sm font-medium">{ui[uiLang].accent}</legend>
        <div className="flex flex-wrap items-center gap-1">
          {ACCENTS.map((a, n) => (
            <button key={a} type="button" aria-label={names[n]} title={names[n]} aria-pressed={design.accent === a} onClick={() => set('accent', a)}
              className="grid size-11 place-items-center rounded-full border border-line bg-panel">
              <span className={`block size-7 rounded-full transition-shadow duration-150 ${design.accent === a ? 'ring-2 ring-ink ring-offset-2 ring-offset-panel' : ''}`} style={{ background: a }} />
            </button>
          ))}
          <label className="ms-2 flex min-h-11 items-center gap-2 text-sm">
            <input type="color" aria-label={t.customColor} value={design.accent} onChange={(e) => set('accent', e.target.value)} className="size-11 cursor-pointer rounded-ctl border border-edge bg-panel p-1" />
            {t.customColor}
          </label>
        </div>
      </fieldset>

      <Field label={t.font}>
        <select className="inp" aria-label={t.font} value={design.fontPair} onChange={(e) => set('fontPair', e.target.value as Design['fontPair'])}>
          {FONT_PAIRS.map((p) => <option key={p} value={p}>{FONT_PAIR_DEFS[p].label}</option>)}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t.fontScale} : ${Math.round(design.fontScale * 100)} %`}>
          <input type="range" min={0.9} max={1.15} step={0.05} value={design.fontScale} onChange={(e) => set('fontScale', +e.target.value)} aria-valuetext={`${Math.round(design.fontScale * 100)} %`} className="h-11 w-full accent-ink" />
        </Field>
        <Field label={`${t.lineHeight} : ${design.lineHeight.toFixed(2)}`}>
          <input type="range" min={1.2} max={1.6} step={0.05} value={design.lineHeight} onChange={(e) => set('lineHeight', +e.target.value)} aria-valuetext={design.lineHeight.toFixed(2)} className="h-11 w-full accent-ink" />
        </Field>
      </div>

      <div className="grid gap-4">
        <div><p className="mb-1 text-sm font-medium">{t.margins}</p>
          <Seg label={t.margins} value={design.margins} onChange={(v) => set('margins', v)} options={[['compact', t.marginOpts.compact], ['normal', t.marginOpts.normal], ['large', t.marginOpts.large]]} /></div>
        <div><p className="mb-1 text-sm font-medium">{t.pageSize}</p>
          <Seg label={t.pageSize} value={design.pageSize} onChange={(v) => set('pageSize', v)} options={[['A4', 'A4'], ['LETTER', 'Letter']]} /></div>
        {!letter && (pages > 1 || design.fitPage) && (
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input type="checkbox" checked={!!design.fitPage} onChange={(e) => set('fitPage', e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" />
            <span><span className="block font-medium">{ft.label}</span><span className="block text-muted">{ft.hint}</span></span>
          </label>
        )}
        {!letter && <><div><p className="mb-1 text-sm font-medium">{t.photoShape}</p>
          <Seg label={t.photoShape} value={design.photoShape} onChange={(v) => set('photoShape', v)} options={[['circle', t.shapes.circle], ['rounded', t.shapes.rounded], ['square', t.shapes.square]]} /></div>
        <div><p className="mb-1 text-sm font-medium">{t.skillDisplay}</p>
          <Seg label={t.skillDisplay} value={design.skillDisplay} onChange={(v) => set('skillDisplay', v)} options={[['text', t.displays.text], ['bars', t.displays.bars], ['dots', t.displays.dots]]} /></div></>}
      </div>
    </div>
  )
}
