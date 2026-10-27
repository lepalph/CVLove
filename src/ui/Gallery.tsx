import { ui } from '../i18n/ui'
import { sampleCV } from '../model/sample'
import { renderLazy } from '../pdf/lazy'
import { PdfCanvas } from '../pdf/PdfCanvas'
import { useStore } from '../store'
import { templates } from '../templates'
import { LangSelect } from './bits'
import { setLang } from '../model/cv'
import { LANGS } from '../model/types'

export function Gallery() {
  const cv = useStore((s) => s.cv)
  const uiLang = useStore((s) => s.uiLang)
  const update = useStore((s) => s.update)
  const t = ui[uiLang]

  const choose = (templateId: string) => {
    update((c) => ({ ...c, templateId }))
    location.hash = '#/edit'
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t.galleryTitle}</h1>
          <p className="mt-1 text-base text-muted">{t.gallerySub}</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t.cvLang}
          <LangSelect label={t.cvLang} value={cv.lang} langs={LANGS} onChange={(l) => update((c) => setLang(c, l))} />
        </label>
      </div>
      <ul className="mt-8 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(14rem,1fr))]">
        {templates.map((tpl) => {
          // Vignette = vrai rendu, données d'exemple dans la langue du CV, couleur d'accent courante
          const sample = { ...sampleCV(cv.lang), templateId: tpl.id, accent: cv.accent }
          return (
            <li key={tpl.id} className="card flex flex-col gap-3 p-3">
              <button type="button" onClick={() => choose(tpl.id)} className="block rounded-[4px] bg-desk p-0 text-start" aria-label={`${t.useTemplate} : ${tpl.name[uiLang]}`}>
                <div className="aspect-[210/297] overflow-hidden rounded-[2px] bg-white shadow-sheet">
                  <PdfCanvas make={() => renderLazy(sample)} deps={[cv.lang, cv.accent, tpl.id]} maxPages={1} />
                </div>
              </button>
              <div className="flex flex-col gap-2">
                <span className="text-lg font-semibold">{tpl.name[uiLang]}</span>
                <button type="button" className="btn btn-primary w-full" onClick={() => choose(tpl.id)}>{t.useTemplate}</button>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
