import { cvLabels, sectionTitle } from '../i18n/labels'
import { tocLabel } from '../i18n/toc'
import { useCvDoc, useStore } from '../store'

/** Sommaire collant du mode complet (bureau seulement) : une pastille par section, un clic y mène (sans replier les autres). Mobile : masqué, la page est déjà longue. */
export function Toc() {
  const cv = useCvDoc().data
  const uiLang = useStore((s) => s.uiLang)
  const labels = cvLabels[cv.lang]
  if (cv.sections.length < 2) return null
  const go = (id: string) => {
    const li = document.querySelector<HTMLElement>(`li[data-rid="${id}"]`)
    li?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    li?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true })
  }
  return (
    <nav data-toc aria-label={tocLabel[uiLang]} className="sticky top-0 z-10 -mx-8 -mt-8 mb-6 hidden border-b border-line bg-panel px-8 py-2 lg:block">
      <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0">
        {cv.sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <button type="button" className="min-h-9 whitespace-nowrap rounded-ctl border border-transparent px-2.5 text-start text-[13px] text-muted transition-colors duration-150 hover:border-edge hover:text-ink" onClick={() => go(s.id)}>{sectionTitle(s, labels)}</button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
