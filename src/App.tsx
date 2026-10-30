import { useEffect, useState } from 'react'
import { isRtl } from './model/dates'
import { useStore } from './store'
import { Editor } from './ui/Editor'
import { Documents } from './ui/Documents'
import { Home } from './ui/Home'
import { LetterEditor } from './ui/LetterEditor'
import { isEmptyCV, isExampleCV } from './ui/lib'

const readView = () => (location.hash.startsWith('#/edit') ? 'edit' : location.hash.startsWith('#/lettre') ? 'letter' : location.hash.startsWith('#/documents') ? 'docs' : 'home')

export function App() {
  const uiLang = useStore((s) => s.uiLang)
  // Un brouillon rempli n'est qu'en mémoire : le navigateur demande confirmation avant de fermer l'onglet.
  const unsaved = useStore((s) => s.documents.some((d) => d.draft && d.kind === 'cv' && !isEmptyCV(d.data) && !isExampleCV(d.data)))
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
    if (!unsaved) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [unsaved])

  useEffect(() => {
    document.documentElement.lang = uiLang
    document.documentElement.dir = isRtl(uiLang) ? 'rtl' : 'ltr'
  }, [uiLang])

  return <div className="flex min-h-dvh flex-col">{view === 'edit' ? <Editor /> : view === 'letter' ? <LetterEditor /> : view === 'docs' ? <Documents /> : <Home />}</div>
}
