import { useRef, useState } from 'react'
import { cvLabels, sectionTitle } from '../i18n/labels'
import { ui, type UI } from '../i18n/ui'
import {
  addCustomField, addItem, addSection, moveItem, moveSection, patchField, patchItem, patchSection,
  removeField, removeItem, removeSection, setLang, addField,
} from '../model/cv'
import { LANGS, SECTION_KINDS, type FieldKind, type Section } from '../model/types'
import { useStore } from '../store'
import { ACCENTS } from '../templates/types'
import { templates } from '../templates'
import { Field, Icon, LangSelect } from './bits'

const FIELD_ORDER: Exclude<FieldKind, 'custom'>[] = ['birthDate', 'location', 'email', 'phone', 'website']

export function Form() {
  const cv = useStore((s) => s.cv)
  const uiLang = useStore((s) => s.uiLang)
  const { update, clearAll, loadSample, importJson } = useStore()
  const t = ui[uiLang]
  const labels = cvLabels[cv.lang]
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const onImport = async (f?: File) => {
    if (!f) return
    try {
      importJson(await f.text())
      setError('')
    } catch {
      setError(t.importError)
    }
  }
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' }))
    Object.assign(document.createElement('a'), { href: url, download: 'cvlove.json' }).click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
  const onPhoto = async (f?: File) => {
    if (!f) return
    const photo = await shrink(f)
    update((c) => ({ ...c, personal: { ...c.personal, photo } }))
  }
  const setPersonal = (patch: Partial<typeof cv.personal>) => update((c) => ({ ...c, personal: { ...c.personal, ...patch } }))

  const missingKinds = FIELD_ORDER.filter((k) => !cv.personal.fields.some((f) => f.kind === k))
  const fieldLabel = (k: FieldKind) => (k === 'custom' ? t.customLabel : t[k])

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.cvLang} hint={t.cvLangHint}>
            <LangSelect wide label={t.cvLang} value={cv.lang} langs={LANGS} onChange={(l) => update((c) => setLang(c, l))} />
          </Field>
          <Field label={t.template}>
            <select className="inp" value={cv.templateId} onChange={(e) => update((c) => ({ ...c, templateId: e.target.value }))}>
              {templates.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name[uiLang]}</option>)}
            </select>
          </Field>
        </div>
        <fieldset className="mt-4">
          <legend className="mb-1 text-sm font-medium">{t.accent}</legend>
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button key={a} type="button" aria-label={a} aria-pressed={cv.accent === a} onClick={() => update((c) => ({ ...c, accent: a }))}
                className="grid size-11 place-items-center rounded-full border border-line bg-panel">
                <span className={`block size-7 rounded-full transition-shadow duration-150 ${cv.accent === a ? 'ring-2 ring-ink ring-offset-2 ring-offset-panel' : ''}`} style={{ background: a }} />
              </button>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card title={t.personal}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.firstName}><input className="inp" value={cv.personal.firstName} onChange={(e) => setPersonal({ firstName: e.target.value })} autoComplete="given-name" /></Field>
          <Field label={t.lastName}><input className="inp" value={cv.personal.lastName} onChange={(e) => setPersonal({ lastName: e.target.value })} autoComplete="family-name" /></Field>
        </div>
        <div className="mt-3"><Field label={t.jobTitle}><input className="inp" value={cv.personal.title} onChange={(e) => setPersonal({ title: e.target.value })} /></Field></div>

        <div className="mt-3 flex items-center gap-3">
          {cv.personal.photo && <img src={cv.personal.photo} alt="" className="size-14 rounded-full object-cover" />}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { void onPhoto(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>{cv.personal.photo ? t.photo : t.addPhoto}</button>
          {cv.personal.photo && <button type="button" className="btn btn-ghost" onClick={() => setPersonal({ photo: '' })}>{t.removePhoto}</button>}
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {cv.personal.fields.map((f) => (
            <li key={f.id} className={`flex items-end gap-1 ${f.visible ? '' : 'opacity-60'}`}>
              {f.kind === 'custom' && (
                <div className="w-1/3"><Field label={t.customLabel}><input className="inp" value={f.label ?? ''} onChange={(e) => update((c) => patchField(c, f.id, { label: e.target.value }))} /></Field></div>
              )}
              <div className="flex-1">
                <Field label={fieldLabel(f.kind)}>
                  <input className="inp" type={f.kind === 'birthDate' ? 'date' : f.kind === 'email' ? 'email' : f.kind === 'phone' ? 'tel' : 'text'}
                    value={f.value} onChange={(e) => update((c) => patchField(c, f.id, { value: e.target.value }))} />
                </Field>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => update((c) => patchField(c, f.id, { visible: !f.visible }))}>{f.visible ? t.hide : t.show}</button>
              <Icon label={t.remove} onClick={() => update((c) => removeField(c, f.id))}>×</Icon>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {missingKinds.map((k) => <button key={k} type="button" className="btn" onClick={() => update((c) => addField(c, k))}>+ {t[k]}</button>)}
          <button type="button" className="btn" onClick={() => update(addCustomField)}>+ {t.addCustomField}</button>
        </div>
      </Card>

      <Card title={t.sections}>
        {cv.sections.length === 0 && <p className="text-base text-muted">{t.sectionsEmpty}</p>}
        <ul className="flex flex-col gap-4">
          {cv.sections.map((s, i) => (
            <SectionEditor key={s.id} s={s} i={i} n={cv.sections.length} t={t} std={labels.sections[s.kind]} />
          ))}
        </ul>
        <p className="mb-2 mt-5 text-sm font-medium">{t.addSection}</p>
        <div className="flex flex-wrap gap-2">
          {SECTION_KINDS.map((k) => <button key={k} type="button" className="btn" onClick={() => update((c) => addSection(c, k))}>+ {t.kinds[k]}</button>)}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={loadSample}>{t.loadSample}</button>
          <button type="button" className="btn" onClick={exportJson}>{t.exportJson}</button>
          <input id="imp" type="file" accept="application/json,.json" hidden onChange={(e) => { void onImport(e.target.files?.[0]); e.target.value = '' }} />
          <label htmlFor="imp" className="btn cursor-pointer">{t.importJson}</label>
          <button type="button" className="btn text-accent-deep" onClick={() => { if (confirm(t.clearConfirm)) clearAll() }}>{t.clearAll}</button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-accent-deep">{error}</p>}
        <p className="mt-3 text-sm text-muted">{t.privacy}</p>
      </Card>
    </div>
  )
}

const Card = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <section className="card p-4">
    {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
    {children}
  </section>
)

function SectionEditor({ s, i, n, t, std }: { s: Section; i: number; n: number; t: UI; std: string }) {
  const update = useStore((st) => st.update)
  const labels = cvLabels[useStore((st) => st.cv.lang)]
  const [ti, su, tx] = t.kindFields[s.kind]
  const dated = s.kind === 'experience' || s.kind === 'education' || s.kind === 'projects' || s.kind === 'custom'
  const multi = s.kind !== 'profile'
  return (
    <li className={`rounded-[8px] border border-line p-3 ${s.visible ? '' : 'bg-desk'}`}>
      <div className="flex items-center gap-1">
        <h3 className="flex-1 text-base font-semibold">
          {sectionTitle(s, labels)}
          {!s.visible && <span className="ms-2 text-sm font-normal text-muted">({t.hidden})</span>}
        </h3>
        <Icon label={t.up} onClick={() => update((c) => moveSection(c, s.id, -1))} disabled={i === 0}>↑</Icon>
        <Icon label={t.down} onClick={() => update((c) => moveSection(c, s.id, 1))} disabled={i === n - 1}>↓</Icon>
        <button type="button" className="btn btn-ghost" onClick={() => update((c) => patchSection(c, s.id, { visible: !s.visible }))}>{s.visible ? t.hide : t.show}</button>
        <Icon label={t.remove} onClick={() => update((c) => removeSection(c, s.id))}>×</Icon>
      </div>
      <div className="mt-2">
        <Field label={t.sectionTitle} hint={`${t.sectionTitleHint} « ${std} »`}>
          <input className="inp" value={s.title} onChange={(e) => update((c) => patchSection(c, s.id, { title: e.target.value }))} />
        </Field>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {s.items.map((it, k) => {
          const set = (p: Partial<typeof it>) => update((c) => patchItem(c, s.id, it.id, p))
          return (
            <li key={it.id} className="rounded-[8px] bg-desk p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {ti && <Field label={ti}><input className="inp" value={it.title} onChange={(e) => set({ title: e.target.value })} /></Field>}
                {su && <Field label={su}><input className="inp" value={it.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>}
                {dated && <Field label={t.place}><input className="inp" value={it.place} onChange={(e) => set({ place: e.target.value })} /></Field>}
                {dated && (
                  <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                    <Field label={t.start}><input className="inp" type="month" placeholder="AAAA-MM" value={it.start} onChange={(e) => set({ start: e.target.value })} /></Field>
                    <Field label={t.end}><input className="inp" type="month" placeholder="AAAA-MM" value={it.end} disabled={it.current} onChange={(e) => set({ end: e.target.value })} /></Field>
                    <label className="col-span-2 flex min-h-11 items-center gap-2 text-sm">
                      <input type="checkbox" className="size-5 accent-accent-deep" checked={it.current} onChange={(e) => set({ current: e.target.checked })} />
                      {t.current}
                    </label>
                  </div>
                )}
              </div>
              {tx && (
                <div className="mt-3">
                  <Field label={tx} hint={dated ? t.bulletsHint : undefined}>
                    <textarea className="inp" rows={dated || s.kind === 'profile' ? 4 : 2} value={it.text} onChange={(e) => set({ text: e.target.value })} />
                  </Field>
                </div>
              )}
              {multi && (
                <div className="mt-2 flex justify-end gap-1">
                  <Icon label={t.up} onClick={() => update((c) => moveItem(c, s.id, it.id, -1))} disabled={k === 0}>↑</Icon>
                  <Icon label={t.down} onClick={() => update((c) => moveItem(c, s.id, it.id, 1))} disabled={k === s.items.length - 1}>↓</Icon>
                  <Icon label={t.remove} onClick={() => update((c) => removeItem(c, s.id, it.id))}>×</Icon>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {multi && <button type="button" className="btn mt-3" onClick={() => update((c) => addItem(c, s.id))}>+ {t.addItem}</button>}
    </li>
  )
}

/** Photo réduite (512 px max, JPEG) avant d'être gardée en data URL : localStorage reste léger. */
async function shrink(file: File, max = 512): Promise<string> {
  const bmp = await createImageBitmap(file)
  const r = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * r)
  c.height = Math.round(bmp.height * r)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.85)
}
