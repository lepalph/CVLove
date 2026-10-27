import { useMemo, useState } from 'react'
import { ui } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { FONT_PAIR_DEFS } from '../pdf/fontPairs'
import { FONT_PAIRS, type Design } from '../model/types'
import { useCvDoc, useStore } from '../store'
import { templates } from '../templates'
import { ACCENTS, CATEGORIES, type Category } from '../templates/types'
import { Field, Seg } from './bits'
import { SamplePage } from './SamplePage'

type Cols = 'all' | '1' | '2'
type Photo = 'all' | 'yes' | 'no'

/** Panneau Design : modèles (vignettes + filtres) et réglages du document actif. Réutilisable tel quel dans le mode guidé. */
export function DesignPanel() {
  const { data: cv, design } = useCvDoc()
  const updateDesign = useStore((s) => s.updateDesign)
  const uiLang = useStore((s) => s.uiLang)
  const t = v2[uiLang]
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [cols, setCols] = useState<Cols>('all')
  const [photo, setPhoto] = useState<Photo>('all')
  const set = <K extends keyof Design>(k: K, v: Design[K]) => updateDesign({ [k]: v })

  const shown = useMemo(
    () => templates.filter((m) => (cat === 'all' || m.category === cat) && (cols === 'all' || String(m.columns) === cols) && (photo === 'all' || m.photo === (photo === 'yes'))),
    [cat, cols, photo],
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3" role="group" aria-label={t.models}>
        <p className="font-mono text-xs uppercase tracking-wide text-muted">{t.models}</p>
        <Seg label={t.category} value={cat} onChange={setCat}
          options={[['all', t.all], ...CATEGORIES.map((c) => [c, t.cats[c]] as const)]} />
        <div className="grid gap-3">
          <Seg label={t.columns} value={cols} onChange={setCols} options={[['all', t.all], ['1', t.oneCol], ['2', t.twoCols]]} />
          <Seg label={t.photoFilter} value={photo} onChange={setPhoto} options={[['all', t.all], ['yes', t.withPhoto], ['no', t.withoutPhoto]]} />
        </div>
        {shown.length === 0 && <p className="text-sm text-muted">{t.noModel}</p>}
        <ul className="m-0 grid max-h-[28rem] list-none grid-cols-3 gap-3 overflow-y-auto p-1">
          {shown.map((m) => {
            const on = design.templateId === m.id
            const name = `${m.layoutName[uiLang]} · ${m.styleName}`
            return (
              <li key={m.id}>
                <button type="button" aria-pressed={on} aria-label={name} onClick={() => updateDesign({ ...m.preset, templateId: m.id })}
                  className="group flex w-full flex-col gap-1.5 rounded-[4px] bg-transparent p-0 text-start">
                  <SamplePage lang={cv.lang} templateId={m.id}
                    className="!shadow-none outline outline-1 -outline-offset-1 outline-edge transition-shadow duration-150 group-hover:outline-faint group-aria-pressed:!outline-2 group-aria-pressed:outline-ink" />
                  <span className={`text-xs leading-tight ${on ? 'font-semibold text-ink' : 'text-muted'}`}>{name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">{ui[uiLang].accent}</legend>
        <div className="flex flex-wrap items-center gap-1">
          {ACCENTS.map((a) => (
            <button key={a} type="button" aria-label={a} aria-pressed={design.accent === a} onClick={() => set('accent', a)}
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
        <select className="inp" value={design.fontPair} onChange={(e) => set('fontPair', e.target.value as Design['fontPair'])}>
          {FONT_PAIRS.map((p) => <option key={p} value={p}>{FONT_PAIR_DEFS[p].label}</option>)}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t.fontScale} : ${Math.round(design.fontScale * 100)} %`}>
          <input type="range" min={0.9} max={1.15} step={0.05} value={design.fontScale} onChange={(e) => set('fontScale', +e.target.value)} className="h-11 w-full accent-ink" />
        </Field>
        <Field label={`${t.lineHeight} : ${design.lineHeight.toFixed(2)}`}>
          <input type="range" min={1.2} max={1.6} step={0.05} value={design.lineHeight} onChange={(e) => set('lineHeight', +e.target.value)} className="h-11 w-full accent-ink" />
        </Field>
      </div>

      <div className="grid gap-4">
        <div><p className="mb-1 text-sm font-medium">{t.margins}</p>
          <Seg label={t.margins} value={design.margins} onChange={(v) => set('margins', v)} options={[['compact', t.marginOpts.compact], ['normal', t.marginOpts.normal], ['large', t.marginOpts.large]]} /></div>
        <div><p className="mb-1 text-sm font-medium">{t.pageSize}</p>
          <Seg label={t.pageSize} value={design.pageSize} onChange={(v) => set('pageSize', v)} options={[['A4', 'A4'], ['LETTER', 'Letter']]} /></div>
        <div><p className="mb-1 text-sm font-medium">{t.photoShape}</p>
          <Seg label={t.photoShape} value={design.photoShape} onChange={(v) => set('photoShape', v)} options={[['circle', t.shapes.circle], ['rounded', t.shapes.rounded], ['square', t.shapes.square]]} /></div>
        <div><p className="mb-1 text-sm font-medium">{t.skillDisplay}</p>
          <Seg label={t.skillDisplay} value={design.skillDisplay} onChange={(v) => set('skillDisplay', v)} options={[['text', t.displays.text], ['bars', t.displays.bars], ['dots', t.displays.dots]]} /></div>
      </div>
    </div>
  )
}
