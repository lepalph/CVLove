import { useEffect, useState } from 'react'
import { isRtl } from './model/dates'
import { useStore } from './store'
import { Editor } from './ui/Editor'
import { Documents } from './ui/Documents'
import { Home } from './ui/Home'
import { Legal } from './ui/Legal'
import { LetterEditor } from './ui/LetterEditor'

const readView = () => (location.hash.startsWith('#/edit') ? 'edit' : location.hash.startsWith('#/lettre') ? 'letter' : location.hash.startsWith('#/documents') ? 'docs' : location.hash.startsWith('#/mentions') ? 'legal' : 'home')

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

  return <div className="flex min-h-dvh flex-col">{view === 'edit' ? <Editor /> : view === 'letter' ? <LetterEditor /> : view === 'docs' ? <Documents /> : view === 'legal' ? <Legal /> : <Home />}</div>
}
