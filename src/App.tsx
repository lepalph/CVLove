import { lazy, Suspense, useEffect, useState } from 'react'
import { isRtl } from './model/dates'
import { useStore } from './store'
import { Home } from './ui/Home'

// Les pages qui ne servent pas au premier affichage sont chargées à la demande (docs/wiki/poids-chargement.md).
const Editor = lazy(() => import('./ui/Editor').then((m) => ({ default: m.Editor })))
const Documents = lazy(() => import('./ui/Documents').then((m) => ({ default: m.Documents })))
const Legal = lazy(() => import('./ui/Legal').then((m) => ({ default: m.Legal })))
const LetterEditor = lazy(() => import('./ui/LetterEditor').then((m) => ({ default: m.LetterEditor })))

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

  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={null}>{view === 'edit' ? <Editor /> : view === 'letter' ? <LetterEditor /> : view === 'docs' ? <Documents /> : view === 'legal' ? <Legal /> : <Home />}</Suspense>
    </div>
  )
}
