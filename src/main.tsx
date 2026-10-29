import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ErrorBoundary } from './ErrorBoundary'
import { readRoute, shell } from './i18n/shell'
import { v2 } from './i18n/v2'
import { useStore } from './store'
import './index.css'

/** Titre d'onglet par page et par langue ; à chaque changement de page, le focus va au titre principal (ou à `main`). Les ancres de l'accueil ne comptent pas. */
function RouteShell() {
  const uiLang = useStore((s) => s.uiLang)
  useEffect(() => {
    const set = () => {
      const r = readRoute()
      const name = r === 'docs' ? v2[uiLang].docs : { home: shell[uiLang].titleHome, edit: shell[uiLang].titleEditor, letter: shell[uiLang].titleLetter }[r]
      document.title = `${name} · CVLove`
    }
    set()
    let last = readRoute()
    const on = () => {
      set()
      const next = readRoute()
      if (next === last) return
      last = next
      // Attend que App ait monté la nouvelle page.
      requestAnimationFrame(() => setTimeout(() => {
        const h = document.querySelector<HTMLElement>('h1') ?? document.getElementById('main')
        h?.setAttribute('tabindex', '-1')
        h?.focus({ preventScroll: true })
      }, 0))
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [uiLang])
  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouteShell />
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
