import { useEffect, useState } from 'react'
import { isRtl } from './model/dates'
import { useStore } from './store'
import { Editor } from './ui/Editor'
import { Home } from './ui/Home'

const readView = () => (location.hash.startsWith('#/edit') ? 'edit' : 'home')

export function App() {
  const uiLang = useStore((s) => s.uiLang)
  const [view, setView] = useState(readView)

  useEffect(() => {
    const on = () => {
      const next = readView()
      setView((prev) => {
        if (prev !== next) scrollTo(0, 0) // changement de vue ; les ancres #comment / #modeles gardent la vue
        return next
      })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => {
    document.documentElement.lang = uiLang
    document.documentElement.dir = isRtl(uiLang) ? 'rtl' : 'ltr'
  }, [uiLang])

  return <div className="flex min-h-dvh flex-col">{view === 'edit' ? <Editor /> : <Home />}</div>
}
