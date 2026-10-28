import { Component, type ReactNode } from 'react'
import { detectLang } from './i18n/ui'
import { exportDocs } from './model/documents'
import { isRtl } from './model/dates'
import { LANGS, type Lang } from './model/types'
import { useStore, wipeStorage } from './store'

const TEXTS: Record<Lang, { title: string; body: string; exportData: string; reset: string }> = {
  fr: { title: 'Un problème est survenu', body: 'Vos données restent sur cet appareil. Exportez-les avant de réinitialiser.', exportData: 'Exporter mes données', reset: 'Réinitialiser (efface mes données)' },
  en: { title: 'Something went wrong', body: 'Your data stays on this device. Export it before resetting.', exportData: 'Export my data', reset: 'Reset (erases my data)' },
  es: { title: 'Ha ocurrido un problema', body: 'Sus datos siguen en este dispositivo. Expórtelos antes de restablecer.', exportData: 'Exportar mis datos', reset: 'Restablecer (borra mis datos)' },
  de: { title: 'Ein Problem ist aufgetreten', body: 'Ihre Daten bleiben auf diesem Gerät. Exportieren Sie sie vor dem Zurücksetzen.', exportData: 'Meine Daten exportieren', reset: 'Zurücksetzen (löscht meine Daten)' },
  it: { title: 'Si è verificato un problema', body: 'I suoi dati restano su questo dispositivo. Li esporti prima di reimpostare.', exportData: 'Esporta i miei dati', reset: 'Reimposta (cancella i miei dati)' },
  pt: { title: 'Ocorreu um problema', body: 'Os seus dados ficam neste dispositivo. Exporte-os antes de repor.', exportData: 'Exportar os meus dados', reset: 'Repor (apaga os meus dados)' },
  ar: { title: 'حدثت مشكلة', body: 'تبقى بياناتك على هذا الجهاز. صدّرها قبل إعادة الضبط.', exportData: 'تصدير بياناتي', reset: 'إعادة الضبط (تمحو بياناتي)' },
}

/** Langue d'interface même si le store est en cause. */
const lang = (): Lang => {
  try {
    const l = useStore.getState().uiLang
    if (LANGS.includes(l)) return l
  } catch { /* store inutilisable */ }
  return detectLang()
}

function exportData() {
  let json: string
  try {
    json = exportDocs(useStore.getState().documents) // format réimportable par « Importer »
  } catch {
    json = localStorage.getItem('cvlove:v2') ?? '{}' // état en mémoire inutilisable : au moins la copie brute
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  a.download = 'cvlove-donnees.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
}

function reset() {
  wipeStorage()
  location.hash = ''
  location.reload()
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(e: unknown) {
    console.error(e)
  }
  render() {
    if (!this.state.failed) return this.props.children
    const l = lang()
    const t = TEXTS[l]
    return (
      <main role="alert" dir={isRtl(l) ? 'rtl' : 'ltr'} lang={l} className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4">
        <h1 className="text-xl font-semibold">{t.title}</h1>
        <p>{t.body}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={exportData}>{t.exportData}</button>
          <button type="button" className="btn" onClick={reset}>{t.reset}</button>
        </div>
      </main>
    )
  }
}
