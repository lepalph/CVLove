import { useEffect, useState } from 'react'
import { ui } from './i18n/ui'
import { isRtl } from './model/dates'
import { LANGS, type Lang } from './model/types'
import { useStore } from './store'
import { Editor } from './ui/Editor'
import { Gallery } from './ui/Gallery'
import { Heart, LangSelect } from './ui/bits'

const readView = () => (location.hash.startsWith('#/edit') ? 'edit' : 'gallery')

export function App() {
  const uiLang = useStore((s) => s.uiLang)
  const setUiLang = useStore((s) => s.setUiLang)
  const [view, setView] = useState(readView)
  const t = ui[uiLang]

  useEffect(() => {
    const on = () => setView(readView())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => {
    document.documentElement.lang = uiLang
    document.documentElement.dir = isRtl(uiLang) ? 'rtl' : 'ltr'
  }, [uiLang])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-line bg-panel px-4 py-2 sm:px-6">
        <a href="#/" className="flex min-h-11 items-center gap-1.5 text-lg font-semibold tracking-tight" aria-label="CVLove">
          CVLove
          <Heart />
        </a>
        <p className="hidden text-sm text-muted md:block">{t.privacy}</p>
        <LangSelect label={t.uiLang} value={uiLang} onChange={(l: Lang) => setUiLang(l)} langs={LANGS} />
      </header>
      {view === 'edit' ? <Editor /> : <Gallery />}
    </div>
  )
}
