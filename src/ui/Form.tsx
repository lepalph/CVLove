import { useId, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { formatMonthInput, parseMonthInput } from '../model/dates'
import { datesText } from '../i18n/dates'
import { cvLabels, sectionTitle } from '../i18n/labels'
import { extra } from '../i18n/extra'
import { sectionsText, sectionSummary } from '../i18n/sections'
import { useSectionDrag } from './sectionDrag'
import { ui, type UI } from '../i18n/ui'
import { v2 } from '../i18n/v2'
import { exportDocs } from '../model/documents'
import {
  addCustomField, addItem, addSection, moveItem, moveSection, moveSectionTo, setCollapsed, patchField, patchItem, patchSection,
  removeField, removeItem, removeSection, setLang, addField,
} from '../model/cv'
import { MAX_PHOTO_FILE_BYTES } from '../model/sanitize'
import { sampleCV } from '../model/sample'
import { LANGS, SECTION_KINDS, type CVDoc, type Lang, type FieldKind, type Item, type Section, type SectionKind } from '../model/types'
import { deleteWith, useCvDoc, useStore } from '../store'
import { undoText } from '../i18n/undo'
import { placeholders } from '../i18n/placeholders'
import { Field, Icon, LangSelect, useWide } from './bits'
import { useClearAll } from './ExampleTools'
import { getTemplate } from '../templates'
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
/** Valeur d'`autocomplete` de chaque champ (1.3.5). Le lieu est une ville : le navigateur propose la sienne. Les champs libres n'en ont pas. */
const AUTOCOMPLETE: Partial<Record<FieldKind, string>> = { birthDate: 'bday', location: 'address-level2', email: 'email', phone: 'tel', website: 'url' }

/**
 * Supprime une ligne de liste, puis rend le focus au voisin (suivant, sinon précédent : son titre ou son premier champ),
 * à défaut au bouton d'ajout `[data-add=scope]` du conteneur. Sans cela le bouton disparaît et le focus tombe sur body (2.4.3).
 */
function removeThenFocus(e: MouseEvent<HTMLElement>, scope: string, remove: () => void) {
  const row = e.currentTarget.closest('li')!
  const near = (row.nextElementSibling ?? row.previousElementSibling)?.querySelector<HTMLElement>('h3, input, select, textarea')
  const add = row.parentElement?.closest('li, section')?.querySelector<HTMLElement>(`[data-add=${scope}]`)
  remove()
  requestAnimationFrame(() => (near ?? add)?.focus())
}

/** Déplace (↑/↓) ; en bout de liste le bouton se désactive et perdrait le focus : il passe à la flèche opposée. */
function moveThenFocus(e: MouseEvent<HTMLButtonElement>, move: () => void) {
  const b = e.currentTarget
  move()
  requestAnimationFrame(() => b.disabled && ((b.textContent === '↑' ? b.nextElementSibling : b.previousElementSibling) as HTMLElement | null)?.focus())
}

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
  const photoBtn = useRef<HTMLButtonElement>(null)
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
        <div className="mt-3"><Field label={t.jobTitle}><input className="inp" placeholder={ph.personal.title} value={cv.personal.title} onChange={(e) => setPersonal({ title: e.target.value })} autoComplete="organization-title" /></Field></div>

        <div className="mt-3 flex items-center gap-3">
          {cv.personal.photo && <img src={cv.personal.photo} alt="" className="size-14 rounded-full object-cover" />}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { void onPhoto(e.target.files?.[0]); e.target.value = '' }} />
          <button ref={photoBtn} data-rid="photo" type="button" className="btn" onClick={() => fileRef.current?.click()}>{cv.personal.photo ? t.photo : t.addPhoto}</button>
          {cv.personal.photo && <button type="button" className="btn btn-ghost" onClick={() => { deleteWith(undoText[useStore.getState().uiLang].photo, 'photo', (c) => ({ ...c, personal: { ...c.personal, photo: '' } })); requestAnimationFrame(() => photoBtn.current?.focus()) }}>{t.removePhoto}</button>}
        </div>
        {photoMsg && <p role="alert" className="mt-2 text-sm text-danger">{photoMsg}</p>}

        <ul className="mt-4 flex flex-col gap-3">
          {cv.personal.fields.map((f) => (
            <li key={f.id} data-rid={f.id} className={`flex items-end gap-1 ${f.visible ? '' : 'opacity-60'}`}>
              {f.kind === 'custom' && (
                <div className="w-2/5 max-w-48 shrink-0"><Field label={t.customLabel}><input className="inp" value={f.label ?? ''} onChange={(e) => update((c) => patchField(c, f.id, { label: e.target.value }))} /></Field></div>
              )}
              <div className="min-w-0 flex-1">
                <Field label={fieldLabel(f.kind)}>
                  <input className="inp" placeholder={ph.personal.fields.find((x) => x.kind === f.kind)?.value} type={f.kind === 'birthDate' ? 'date' : f.kind === 'email' ? 'email' : f.kind === 'phone' ? 'tel' : 'text'}
                    value={f.value} onChange={(e) => update((c) => patchField(c, f.id, { value: e.target.value }))} autoComplete={AUTOCOMPLETE[f.kind]} />
                </Field>
              </div>
              <Icon label={`${f.visible ? t.hide : t.show}${t.onItem.replace('{x}', fieldName(f))}`} onClick={() => update((c) => patchField(c, f.id, { visible: !f.visible }))}>
                {/* l'œil montre l'état (barré = masqué dans le PDF), le nom accessible dit l'action */}
                <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" className="fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{!f.visible && <path d="m3 3 18 18" />}</svg>
              </Icon>
              <Icon label={`${t.remove}${t.onItem.replace('{x}', fieldName(f))}`} onClick={(e) => removeThenFocus(e, 'field', () => deleteWith(fieldName(f), f.id, (c) => removeField(c, f.id)))}>×</Icon>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {missingKinds.map((k) => <button key={k} type="button" data-add="field" className="btn" onClick={() => update((c) => addField(c, k))}>+ {t[k]}</button>)}
          <button type="button" data-add="field" className="btn" onClick={() => update(addCustomField)}>+ {t.addCustomField}</button>
        </div>
      </Card>
  )
}

/**
 * Sections du CV. Sans `only`, toutes (mode complet) ; avec `only`, seulement ces types (une étape du mode guidé) : les boutons d'ajout
 * proposent alors les types de `add` qui n'existent pas encore (les sections libres restent toujours ajoutables). `title === false` : pas de titre.
 */
export function SectionsCard({ only, add = SECTION_KINDS, title }: { only?: readonly SectionKind[]; add?: readonly SectionKind[]; title?: string | false }) {
  const { data: cv, design } = useCvDoc()
  const update = useStore((s) => s.update)
  const uiLang = useStore((s) => s.uiLang)
  const t = ui[uiLang]
  const labels = cvLabels[cv.lang]
  const apart = getTemplate(design.templateId).apart
  const shown = cv.sections.map((s, i) => ({ s, i })).filter(({ s }) => !only || only.includes(s.kind))
  const addable = add.filter((k) => k === 'custom' || !cv.sections.some((s) => s.kind === k)) // une section déjà présente ne se rajoute pas
  const [picking, setPicking] = useState(!!only) // mode complet : un seul bouton « Ajouter une section », qui déplie les types
  const addRef = useRef<HTMLButtonElement>(null)
  const sx = sectionsText[uiLang]
  const [said, setSaid] = useState('') // annonce du dernier déplacement (zone role=status toujours présente)
  const [note, setNote] = useState<{ id: string; text: string }>() // déplacement que le PDF ne montre pas (modèle à deux colonnes)
  /** Après un déplacement de `id` vers le rang `to` (rangs d'avant le déplacement) : annonce, et note si la section a passé une section de l'autre colonne. */
  const moved = (id: string, to: number) => {
    const from = cv.sections.findIndex((s) => s.id === id)
    const s = cv.sections[from]
    const name = sectionTitle(s, labels)
    const side = (k: SectionKind) => !!apart?.includes(k)
    const crossed = cv.sections.slice(Math.min(from, to), Math.max(from, to) + 1).some((x) => side(x.kind) !== side(s.kind))
    setNote(crossed ? { id, text: sx.apart.replace('{x}', name) } : undefined)
    setSaid(`${sx.moved.replace('{x}', name).replace('{n}', String(to + 1)).replace('{total}', String(cv.sections.length))}${crossed ? `. ${sx.apart.replace('{x}', name)}` : ''}`)
  }
  const { list, drag, start } = useSectionDrag(shown.map(({ s }) => s.id), (id, pos) => {
    const to = shown[pos].i
    update((c) => moveSectionTo(c, id, to))
    moved(id, to)
  })
  const ids = shown.map(({ s }) => s.id)
  const anyFolded = shown.some(({ s }) => s.collapsed)
  return (
      <Card title={title === false ? undefined : (title ?? t.sections)} action={shown.length > 1 && (anyFolded
        ? <button type="button" className="btn btn-ghost text-sm text-muted" onClick={() => update((c) => setCollapsed(c, false, ids))}>{sx.expandAll}</button>
        : <button type="button" className="btn btn-ghost text-sm text-muted" onClick={() => update((c) => setCollapsed(c, true, ids))}>{sx.collapseAll}</button>)}>
        <p role="status" className="sr-only">{said}</p>
        {!only && cv.sections.length === 0 && <p className="text-base text-muted">{t.sectionsEmpty}</p>}
        <div className="relative">
          <ul ref={list} className="flex flex-col gap-6">
            {shown.map(({ s, i }) => (
              <SectionEditor key={s.id} s={s} i={i} n={cv.sections.length} t={t} std={labels.sections[s.kind]} grab={(e) => start(e, s.id)} dy={drag?.id === s.id ? drag.dy : undefined} onMoved={(to) => moved(s.id, to)} note={apart && note?.id === s.id ? note.text : undefined} />
            ))}
          </ul>
          {drag && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-20 h-0.5 -translate-y-px bg-ink" style={{ top: drag.bar }} />}
        </div>
        {addable.length > 0 && !picking && <button ref={addRef} type="button" data-add="section" className="btn mt-5" onClick={() => setPicking(true)}>+ {t.addSection}</button>}
        {addable.length > 0 && picking && (
          <>
            <p className="mb-2 mt-5 text-sm font-medium">{t.addSection}</p>
            <div className="flex flex-wrap gap-2">
              {addable.map((k, i) => <button key={k} type="button" data-add="section" className="btn" autoFocus={!only && i === 0} onClick={() => { update((c) => addSection(c, k)); if (!only) { setPicking(false); requestAnimationFrame(() => addRef.current?.focus()) } }}>+ {t.kinds[k]}</button>)}
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

/** Bas du formulaire : charger l'exemple, lettre assortie, tout effacer. Export et import JSON sont dans le menu Fichier de l'en-tête. */
export function DataCard() {
  const doc = useCvDoc()
  const loadSample = useStore((s) => s.loadSample)
  const t = ui[useStore((s) => s.uiLang)]
  const clear = useClearAll()
  return (
      <Card>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => { if (isEmptyCV(doc.data) || isExampleCV(doc.data) || confirm(t.clearConfirm)) loadSample() }}>{t.loadSample}</button>
          <LetterLink />
          <button type="button" className="btn text-danger" onClick={clear}>{t.clearAll}</button>
        </div>
        <p className="mt-3 text-sm text-muted">{t.privacy}</p>
      </Card>
  )
}

export const Card = ({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <section className="border-t border-line pt-6 first:border-t-0 first:pt-0">
    {(title || action) && (
      <div className="mb-4 flex items-center justify-between gap-2">
        {title && <h2 className="m-0 text-xl font-semibold tracking-tight">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
)

export function SectionEditor({ s, i, n, t, std, grab, dy, onMoved, note }: { s: Section; i: number; n: number; t: UI; std: string; grab?: (e: PointerEvent<HTMLElement>) => void; dy?: number; onMoved?: (to: number) => void; note?: string }) {
  const update = useStore((st) => st.update)
  const labels = cvLabels[useCvDoc().data.lang]
  const uiLang = useStore((st) => st.uiLang)
  const tv = v2[uiLang]
  const ph = usePlaceholders()
  const [ti, su, tx] = t.kindFields[s.kind]
  const dated = s.kind === 'experience' || s.kind === 'education' || s.kind === 'projects' || s.kind === 'custom'
  const multi = s.kind !== 'profile'
  const onSec = (verb: string) => verb + t.onSection.replace('{x}', sectionTitle(s, labels))
  const sx = sectionsText[uiLang]
  const folded = !!s.collapsed
  const toggle = () => update((c) => patchSection(c, s.id, { collapsed: folded ? undefined : true }))
  return (
    <li data-rid={s.id} className={`border-t border-line pt-4 first:border-t-0 first:pt-0 ${s.visible ? '' : 'opacity-70'} ${dy === undefined ? '' : 'relative z-30 bg-panel shadow-lg'}`} style={dy === undefined ? undefined : { transform: `translateY(${dy}px)` }}>
      <div className="flex items-center gap-1">
        {/* Titre et résumé : un clic replie ou déplie (raccourci souris) ; le clavier passe par le chevron. */}
        <div className="min-w-0 flex-1 cursor-pointer py-1" onClick={toggle}>
          <h3 tabIndex={-1} className="text-base font-semibold">
            {sectionTitle(s, labels)}
            {!s.visible && <span className="ms-2 text-sm font-normal text-muted">({t.hidden})</span>}
          </h3>
          {folded && <p className="m-0 truncate text-sm text-muted">{sectionSummary(s, uiLang)}</p>}
        </div>
        {grab && <button type="button" className="btn btn-ghost cursor-grab touch-none px-0 text-muted active:cursor-grabbing" aria-label={onSec(sx.drag)} title={onSec(sx.drag)} onPointerDown={grab}><svg aria-hidden="true" viewBox="0 0 16 16" width="20" height="20" className="fill-current">{[4, 8, 12].flatMap((y) => [6, 10].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.4" />))}</svg></button>}
        <button type="button" className="btn btn-ghost px-0" aria-expanded={!folded} aria-controls={`sec-${s.id}`} aria-label={onSec(folded ? sx.expand : sx.collapse)} title={onSec(folded ? sx.expand : sx.collapse)} onClick={toggle}>
          <svg aria-hidden="true" viewBox="0 0 16 16" width="20" height="20" className={`fill-none stroke-current stroke-2 transition-transform duration-150 motion-reduce:transition-none ${folded ? 'rtl:rotate-180' : 'rotate-90'}`}><path d="m6 3.5 4.5 4.5L6 12.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      {note && <p aria-hidden="true" className="m-0 text-sm text-muted">{note}</p>}
      <div id={`sec-${s.id}`} hidden={folded}>
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
            <li key={it.id} data-rid={it.id} className="border-s-2 border-line ps-4">
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
                    <DatePick legend={t.end} lang={uiLang} value={it.end} disabled={it.current} notBefore={it.start} onChange={(end) => set({ end })} />
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
                  <Icon label={onItem(t.up)} onClick={(e) => moveThenFocus(e, () => update((c) => moveItem(c, s.id, it.id, -1)))} disabled={k === 0}>↑</Icon>
                  <Icon label={onItem(t.down)} onClick={(e) => moveThenFocus(e, () => update((c) => moveItem(c, s.id, it.id, 1)))} disabled={k === s.items.length - 1}>↓</Icon>
                  <Icon label={onItem(t.remove)} onClick={(e) => removeThenFocus(e, 'item', () => deleteWith([it.title, it.subtitle].filter(Boolean).join(', ') || String(k + 1), it.id, (c) => removeItem(c, s.id, it.id)))}>×</Icon>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {multi && <button type="button" data-add="item" className="btn mt-3" onClick={() => update((c) => addItem(c, s.id))}>+ {t.addItem}</button>}
      {/* Actions de la section : seulement section ouverte, en bas, pour que la ligne repliée reste propre (voir docs/wiki/audit-ux-editeur.md). */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-1">
        <Icon label={onSec(t.up)} onClick={(e) => moveThenFocus(e, () => { update((c) => moveSection(c, s.id, -1)); onMoved?.(i - 1) })} disabled={i === 0}>↑</Icon>
        <Icon label={onSec(t.down)} onClick={(e) => moveThenFocus(e, () => { update((c) => moveSection(c, s.id, 1)); onMoved?.(i + 1) })} disabled={i === n - 1}>↓</Icon>
        <button type="button" className="btn btn-ghost" aria-label={onSec(s.visible ? t.hide : t.show)} onClick={() => update((c) => patchSection(c, s.id, { visible: !s.visible }))}>{s.visible ? t.hide : t.show}</button>
        <button type="button" className="btn btn-ghost text-danger" aria-label={onSec(t.remove)} onClick={(e) => removeThenFocus(e, 'section', () => deleteWith(sectionTitle(s, labels), s.id, (c) => removeSection(c, s.id)))}>{t.remove}</button>
      </div>
      </div>
    </li>
  )
}

const QUOTES: Partial<Record<Lang, [string, string]>> = { fr: ['« ', ' »'], en: ['“', '”'], de: ['„', '“'] }
/** Cite un texte avec les guillemets de la langue de l'interface. */
const quote = (lang: Lang, x: string) => { const [a, b] = QUOTES[lang] ?? ['«', '»']; return a + x + b }

/**
 * Date en un seul champ texte (« 03/2021 », « mars 2021 », « 2021 »…), lue par `parseMonthInput`. Stockage inchangé : AAAA-MM ou AAAA.
 * On valide en sortie de champ (ou Entrée) : le texte est alors normalisé en MM/AAAA. Un texte invalide reste affiché avec son erreur ;
 * la valeur gardée n'est pas touchée. Pas d'inputmode numérique : il masquerait les lettres des noms de mois.
 * `notBefore` : date de début, la fin ne peut pas la précéder (on compare sur la précision commune : année, ou année + mois).
 */
function DatePick({ legend, lang, value, onChange, disabled, notBefore }: { legend: string; lang: Lang; value: string; onChange: (v: string) => void; disabled?: boolean; notBefore?: string }) {
  const d = datesText[lang]
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null) // texte en cours de saisie ; null = on affiche la valeur gardée
  const [typed, setError] = useState('') // erreur de la dernière saisie
  const [seen, setSeen] = useState(value)
  if (value !== seen) { setSeen(value); setDraft(null); setError('') } // la valeur gardée a changé ailleurs (annulation, import, exemple, autre onglet) : le brouillon est périmé
  const before = (v: string) => { const n = Math.min(v.length, notBefore?.length ?? 0); return !!n && v.slice(0, n) < notBefore!.slice(0, n) }
  const commit = () => {
    if (draft === null) return
    const r = parseMonthInput(draft, lang)
    if (!r.ok) return setError(d.invalid)
    if (before(r.value)) return setError(d.beforeStart)
    setError('')
    setDraft(null)
    if (r.value !== value) onChange(r.value)
  }
  // la date de début a pu changer après coup : l'ordre se revérifie sur la valeur gardée, pas seulement en sortie de ce champ
  const error = typed || (draft === null && !disabled && value && before(value) ? d.beforeStart : '')
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{legend}</label>
      <input
        id={id} className={`inp ${error ? 'border-danger' : ''}`} dir="ltr" autoComplete="off" disabled={disabled}
        placeholder={d.placeholder} value={draft ?? formatMonthInput(value)}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => { setDraft(e.target.value); setError('') }}
        onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit() } }}
      />
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-danger">{error}</p>}
    </div>
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
