import { useMemo, useRef, useState } from 'react'
import { monthNames } from '../model/dates'
import { cvLabels, sectionTitle } from '../i18n/labels'
import { extra } from '../i18n/extra'
import { ui, type UI } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { exportDocs } from '../model/documents'
import {
  addCustomField, addItem, addSection, moveItem, moveSection, patchField, patchItem, patchSection,
  removeField, removeItem, removeSection, setLang, addField,
} from '../model/cv'
import { MAX_IMPORT_BYTES, MAX_PHOTO_FILE_BYTES } from '../model/sanitize'
import { sampleCV } from '../model/sample'
import { LANGS, SECTION_KINDS, type CVDoc, type Lang, type FieldKind, type Item, type Section, type SectionKind } from '../model/types'
import { useCvDoc, useStore } from '../store'
import { placeholders } from '../i18n/placeholders'
import { Field, Icon, LangSelect, useWide } from './bits'
import { useClearAll } from './ExampleTools'
import { isEmptyCV, isExampleCV } from './lib'
import { DesignPanel } from './DesignPanel'
import { LetterLink } from './LetterLink'

/** L'exemple (Camille, Laila…) ne sert qu'en gris : champs vides + placeholders de la langue du CV, jamais de valeur écrite à la place de l'utilisateur. */
const usePlaceholders = () => {
  const lang = useCvDoc().data.lang
  const ph = useMemo(() => sampleCV(lang), [lang])
  return useMemo(() => ({ ...ph, personal: { ...ph.personal, title: placeholders[lang].jobTitle }, neutral: placeholders[lang].kinds }), [ph, lang])
}
/** Exemple neutre du premier élément ; les suivants (et les sections sans exemple neutre) reprennent le CV d'exemple. */
const phItem = (ph: ReturnType<typeof usePlaceholders>, kind: SectionKind, k: number): Partial<Item> => {
  const items = ph.sections.find((s) => s.kind === kind)?.items ?? []
  return { ...(items[k] ?? items[0]), ...ph.neutral[kind] }
}

const FIELD_ORDER: Exclude<FieldKind, 'custom'>[] = ['birthDate', 'location', 'email', 'phone', 'website']

/** Formulaire complet = ces cartes, dans l'ordre. Chacune est autonome : le mode guidé peut les monter une par une. */
export function Form() {
  return (
    <div className="flex flex-col gap-6">
      <LanguageCard />
      <DesignCard />
      <PersonalCard />
      <SectionsCard />
      <DataCard />
    </div>
  )
}

export function LanguageCard() {
  const cv = useCvDoc().data
  const update = useStore((s) => s.update)
  const t = ui[useStore((s) => s.uiLang)]
  return (
    <Card>
      <Field label={t.cvLang} hint={t.cvLangHint}>
        <LangSelect wide label={t.cvLang} value={cv.lang} langs={LANGS} onChange={(l) => update((c) => setLang(c, l))} />
      </Field>
    </Card>
  )
}

export function DesignCard() {
  const uiLang = useStore((s) => s.uiLang)
  const wide = useWide()
  const [open, setOpen] = useState<boolean>() // ouvert par défaut sur grand écran ; replié sur mobile pour que le formulaire passe en premier
  return (
    <Card>
      <details open={open ?? wide} onToggle={(e) => setOpen(e.currentTarget.open)} className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xl font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
          {v2[uiLang].design}
          <span aria-hidden="true" className="text-muted transition-transform duration-150 group-open:rotate-180">⌄</span>
        </summary>
        <div className="mt-4"><DesignPanel /></div>
      </details>
    </Card>
  )
}

export function PersonalCard() {
  const cv = useCvDoc().data
  const ph = usePlaceholders()
  const update = useStore((s) => s.update)
  const t = ui[useStore((s) => s.uiLang)]
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoMsg, setPhotoMsg] = useState('')
  const onPhoto = async (f?: File) => {
    if (!f) return
    const x = extra[useStore.getState().uiLang]
    if (f.size > MAX_PHOTO_FILE_BYTES) return setPhotoMsg(x.tooBig.replace('{mb}', String(MAX_PHOTO_FILE_BYTES / 1e6)))
    try {
      const photo = await shrink(f)
      setPhotoMsg('')
      update((c) => ({ ...c, personal: { ...c.personal, photo } }))
    } catch {
      setPhotoMsg(x.photoError)
    }
  }
  const setPersonal = (patch: Partial<typeof cv.personal>) => update((c) => ({ ...c, personal: { ...c.personal, ...patch } }))
  const missingKinds = FIELD_ORDER.filter((k) => !cv.personal.fields.some((f) => f.kind === k))
  const fieldName = (f: (typeof cv.personal.fields)[number]) => (f.kind === 'custom' ? f.label || t.customLabel : t[f.kind])
  const fieldLabel = (k: FieldKind) => (k === 'custom' ? t.customValue : t[k])
  return (
      <Card title={t.personal}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.firstName}><input className="inp" placeholder={ph.personal.firstName} value={cv.personal.firstName} onChange={(e) => setPersonal({ firstName: e.target.value })} autoComplete="given-name" /></Field>
          <Field label={t.lastName}><input className="inp" placeholder={ph.personal.lastName} value={cv.personal.lastName} onChange={(e) => setPersonal({ lastName: e.target.value })} autoComplete="family-name" /></Field>
        </div>
        <div className="mt-3"><Field label={t.jobTitle}><input className="inp" placeholder={ph.personal.title} value={cv.personal.title} onChange={(e) => setPersonal({ title: e.target.value })} /></Field></div>

        <div className="mt-3 flex items-center gap-3">
          {cv.personal.photo && <img src={cv.personal.photo} alt="" className="size-14 rounded-full object-cover" />}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { void onPhoto(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>{cv.personal.photo ? t.photo : t.addPhoto}</button>
          {cv.personal.photo && <button type="button" className="btn btn-ghost" onClick={() => setPersonal({ photo: '' })}>{t.removePhoto}</button>}
        </div>
        {photoMsg && <p role="alert" className="mt-2 text-sm text-danger">{photoMsg}</p>}

        <ul className="mt-4 flex flex-col gap-3">
          {cv.personal.fields.map((f) => (
            <li key={f.id} className={`flex items-end gap-1 ${f.visible ? '' : 'opacity-60'}`}>
              {f.kind === 'custom' && (
                <div className="w-2/5 max-w-48 shrink-0"><Field label={t.customLabel}><input className="inp" value={f.label ?? ''} onChange={(e) => update((c) => patchField(c, f.id, { label: e.target.value }))} /></Field></div>
              )}
              <div className="min-w-0 flex-1">
                <Field label={fieldLabel(f.kind)}>
                  <input className="inp" placeholder={ph.personal.fields.find((x) => x.kind === f.kind)?.value} type={f.kind === 'birthDate' ? 'date' : f.kind === 'email' ? 'email' : f.kind === 'phone' ? 'tel' : 'text'}
                    value={f.value} onChange={(e) => update((c) => patchField(c, f.id, { value: e.target.value }))} />
                </Field>
              </div>
              <button type="button" className="btn btn-ghost" aria-label={`${f.visible ? t.hide : t.show}${t.onItem.replace('{x}', fieldName(f))}`} onClick={() => update((c) => patchField(c, f.id, { visible: !f.visible }))}>{f.visible ? t.hide : t.show}</button>
              <Icon label={`${t.remove}${t.onItem.replace('{x}', fieldName(f))}`} onClick={() => update((c) => removeField(c, f.id))}>×</Icon>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {missingKinds.map((k) => <button key={k} type="button" className="btn" onClick={() => update((c) => addField(c, k))}>+ {t[k]}</button>)}
          <button type="button" className="btn" onClick={() => update(addCustomField)}>+ {t.addCustomField}</button>
        </div>
      </Card>
  )
}

/**
 * Sections du CV. Sans `only`, toutes (mode complet) ; avec `only`, seulement ces types (une étape du mode guidé) : les boutons d'ajout
 * proposent alors les types de `add` qui n'existent pas encore (les sections libres restent toujours ajoutables). `title === false` : pas de titre.
 */
export function SectionsCard({ only, add = SECTION_KINDS, title }: { only?: readonly SectionKind[]; add?: readonly SectionKind[]; title?: string | false }) {
  const cv = useCvDoc().data
  const update = useStore((s) => s.update)
  const uiLang = useStore((s) => s.uiLang)
  const t = ui[uiLang]
  const x = extra[uiLang]
  const labels = cvLabels[cv.lang]
  const shown = cv.sections.map((s, i) => ({ s, i })).filter(({ s }) => !only || only.includes(s.kind))
  const addable = add.filter((k) => !only || k === 'custom' || !cv.sections.some((s) => s.kind === k))
  return (
      <Card title={title === false ? undefined : (title ?? t.sections)}>
        {!only && cv.sections.length === 0 && <p className="text-base text-muted">{t.sectionsEmpty}</p>}
        {shown.length > 0 && <p className="mb-4 text-sm text-muted">{x.visibilityHint}</p>}
        <ul className="flex flex-col gap-6">
          {shown.map(({ s, i }) => (
            <SectionEditor key={s.id} s={s} i={i} n={cv.sections.length} t={t} std={labels.sections[s.kind]} />
          ))}
        </ul>
        {addable.length > 0 && (
          <>
            <p className="mb-2 mt-5 text-sm font-medium">{t.addSection}</p>
            <div className="flex flex-wrap gap-2">
              {addable.map((k) => <button key={k} type="button" className="btn" onClick={() => update((c) => addSection(c, k))}>+ {t.kinds[k]}</button>)}
            </div>
          </>
        )}
      </Card>
  )
}

/** Télécharge le document en JSON (`cvlove.json`). */
export function exportJson(doc: CVDoc) {
  const url = URL.createObjectURL(new Blob([exportDocs([doc])], { type: 'application/json' }))
  Object.assign(document.createElement('a'), { href: url, download: 'cvlove.json' }).click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function DataCard() {
  const doc = useCvDoc()
  const { loadSample, importJson } = useStore()
  const uiLang = useStore((s) => s.uiLang)
  const t = ui[uiLang]
  const clear = useClearAll()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>()
  const onImport = async (f?: File) => {
    if (!f) return
    if (f.size > MAX_IMPORT_BYTES) return setMsg({ ok: false, text: extra[uiLang].tooBig.replace('{mb}', String(MAX_IMPORT_BYTES / 1e6)) })
    try {
      importJson(await f.text())
      setMsg({ ok: true, text: extra[uiLang].fileImported })
    } catch {
      setMsg({ ok: false, text: t.importError })
    }
  }
  return (
      <Card>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => { if (isEmptyCV(doc.data) || isExampleCV(doc.data) || confirm(t.clearConfirm)) loadSample() }}>{t.loadSample}</button>
          <button type="button" className="btn" onClick={() => exportJson(doc)}>{t.exportJson}</button>
          <LetterLink />
          <input id="imp" ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { void onImport(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>{t.importJson}</button>
          <button type="button" className="btn text-danger" onClick={clear}>{t.clearAll}</button>
        </div>
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mt-2 text-sm ${msg.ok ? 'text-muted' : 'text-danger'}`}>{msg.text}</p>}
        <p className="mt-3 text-sm text-muted">{t.privacy}</p>
      </Card>
  )
}

export const Card = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <section className="border-t border-line pt-6 first:border-t-0 first:pt-0">
    {title && <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>}
    {children}
  </section>
)

export function SectionEditor({ s, i, n, t, std }: { s: Section; i: number; n: number; t: UI; std: string }) {
  const update = useStore((st) => st.update)
  const labels = cvLabels[useCvDoc().data.lang]
  const uiLang = useStore((st) => st.uiLang)
  const tv = v2[uiLang]
  const ph = usePlaceholders()
  const [ti, su, tx] = t.kindFields[s.kind]
  const dated = s.kind === 'experience' || s.kind === 'education' || s.kind === 'projects' || s.kind === 'custom'
  const multi = s.kind !== 'profile'
  const onSec = (verb: string) => verb + t.onSection.replace('{x}', sectionTitle(s, labels))
  return (
    <li className={`border-t border-line pt-4 first:border-t-0 first:pt-0 ${s.visible ? '' : 'opacity-70'}`}>
      <div className="flex items-center gap-1">
        <h3 className="flex-1 text-base font-semibold">
          {sectionTitle(s, labels)}
          {!s.visible && <span className="ms-2 text-sm font-normal text-muted">({t.hidden})</span>}
        </h3>
        <Icon label={onSec(t.up)} onClick={() => update((c) => moveSection(c, s.id, -1))} disabled={i === 0}>↑</Icon>
        <Icon label={onSec(t.down)} onClick={() => update((c) => moveSection(c, s.id, 1))} disabled={i === n - 1}>↓</Icon>
        <button type="button" className="btn btn-ghost" aria-label={onSec(s.visible ? t.hide : t.show)} onClick={() => update((c) => patchSection(c, s.id, { visible: !s.visible }))}>{s.visible ? t.hide : t.show}</button>
        <Icon label={onSec(t.remove)} onClick={() => update((c) => removeSection(c, s.id))}>×</Icon>
      </div>
      <div className="mt-2">
        <Field label={t.sectionTitle} hint={`${t.sectionTitleHint} ${quote(uiLang, std)}`}>
          <input className="inp" placeholder={std} value={s.title} onChange={(e) => update((c) => patchSection(c, s.id, { title: e.target.value }))} />
        </Field>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {s.items.map((it, k) => {
          const set = (p: Partial<typeof it>) => update((c) => patchItem(c, s.id, it.id, p))
          const eg = phItem(ph, s.kind, k)
          const onItem = (verb: string) => verb + t.onItem.replace('{x}', [it.title, it.subtitle].filter(Boolean).join(', ') || String(k + 1))
          return (
            <li key={it.id} className="border-s-2 border-line ps-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {ti && <Field label={ti}><input className="inp" placeholder={eg.title} value={it.title} onChange={(e) => set({ title: e.target.value })} /></Field>}
                {(s.kind === 'skills' || s.kind === 'languages') && (
                  <Field label={s.kind === 'languages' ? t.levelOf5 : tv.level}>
                    <select className="inp" value={it.level ?? 0} onChange={(e) => set({ level: +e.target.value })}>
                      <option value={0}>{tv.noLevel}</option>
                      {labels.levels.map((l, n) => <option key={n} value={n + 1}>{n + 1} · {l}</option>)}
                    </select>
                  </Field>
                )}
                {su && <Field label={su}><input className="inp" placeholder={eg.subtitle} value={it.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>}
                {dated && <Field label={t.place}><input className="inp" placeholder={eg.place} value={it.place} onChange={(e) => set({ place: e.target.value })} /></Field>}
                {dated && (
                  <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                    <DatePick legend={t.start} lang={uiLang} value={it.start} onChange={(start) => set({ start })} />
                    <DatePick legend={t.end} lang={uiLang} value={it.end} disabled={it.current} onChange={(end) => set({ end })} />
                    <label className="sm:col-span-2 flex min-h-11 items-center gap-2 text-sm">
                      <input type="checkbox" className="size-5 accent-ink" checked={it.current} onChange={(e) => set({ current: e.target.checked })} />
                      {t.current}
                    </label>
                  </div>
                )}
              </div>
              {tx && (
                <div className="mt-3">
                  <Field label={tx} hint={dated ? t.bulletsHint : undefined}>
                    <textarea className="inp" rows={dated || s.kind === 'profile' ? 4 : 2} placeholder={eg.text} value={it.text} onChange={(e) => set({ text: e.target.value })} />
                  </Field>
                </div>
              )}
              {multi && (
                <div className="mt-2 flex justify-end gap-1">
                  <Icon label={onItem(t.up)} onClick={() => update((c) => moveItem(c, s.id, it.id, -1))} disabled={k === 0}>↑</Icon>
                  <Icon label={onItem(t.down)} onClick={() => update((c) => moveItem(c, s.id, it.id, 1))} disabled={k === s.items.length - 1}>↓</Icon>
                  <Icon label={onItem(t.remove)} onClick={() => update((c) => removeItem(c, s.id, it.id))}>×</Icon>
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

const QUOTES: Partial<Record<Lang, [string, string]>> = { fr: ['« ', ' »'], en: ['“', '”'], de: ['„', '“'] }
/** Cite un texte avec les guillemets de la langue de l'interface. */
const quote = (lang: Lang, x: string) => { const [a, b] = QUOTES[lang] ?? ['«', '»']; return a + x + b }

/**
 * Date AAAA-MM en deux listes natives, Mois et Année. Année seule -> « AAAA » (le PDF n'affiche alors que l'année) ;
 * un mois choisi avant l'année attend l'année (état local) plutôt que d'inventer une année.
 */
function DatePick({ legend, lang, value, onChange, disabled }: { legend: string; lang: Lang; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const t = ui[lang]
  const [y, m = ''] = value.split('-')
  const [pending, setPending] = useState('')
  const month = m || pending
  const top = new Date().getFullYear() + 1
  const years = Array.from({ length: top - 1959 }, (_, i) => String(top - i))
  if (y && !years.includes(y)) years.push(y)
  const names = useMemo(() => monthNames(lang, 'short'), [lang]) // court : « sept. » tient dans la colonne
  const setMonth = (v: string) => { setPending(v); if (y) onChange(v ? `${y}-${v}` : y) }
  const setYear = (v: string) => { setPending(month); onChange(v ? (month ? `${v}-${month}` : v) : '') }
  return (
    <fieldset disabled={disabled} className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-1 p-0 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-2 gap-2">
        <select className="inp" aria-label={`${legend} : ${t.month}`} value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">{t.month}</option>
          {names.map((n, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{n}</option>)}
        </select>
        <select className="inp" aria-label={`${legend} : ${t.year}`} value={y} onChange={(e) => setYear(e.target.value)}>
          <option value="">{t.year}</option>
          {years.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    </fieldset>
  )
}

/** Photo réduite (512 px max, JPEG) avant d'être gardée en data URL : localStorage reste léger. */
async function shrink(file: File, max = 512): Promise<string> {
  const bmp = await createImageBitmap(file)
  const r = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * r)
  c.height = Math.round(bmp.height * r)
  const g = c.getContext('2d')!
  g.fillStyle = '#fff' // PNG transparent : fond blanc plutôt que noir en JPEG
  g.fillRect(0, 0, c.width, c.height)
  g.drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.85)
}
