import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { detectLang } from './i18n/ui'
import { emptyCV, parseCV } from './model/cv'
import { sampleCV } from './model/sample'
import type { CV, Lang } from './model/types'

interface State {
  cv: CV
  uiLang: Lang
  /** Applique une fonction pure de model/cv.ts au CV courant. */
  update: (fn: (cv: CV) => CV) => void
  setUiLang: (l: Lang) => void
  clearAll: () => void
  loadSample: () => void
  importJson: (json: string) => void
}

const initialLang = detectLang()

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      cv: sampleCV(initialLang), // données d'exemple pour démarrer
      uiLang: initialLang,
      update: (fn) => set({ cv: fn(get().cv) }),
      setUiLang: (uiLang) => set({ uiLang }),
      clearAll: () => set({ cv: { ...emptyCV(get().cv.lang), templateId: get().cv.templateId, accent: get().cv.accent } }),
      loadSample: () => set({ cv: { ...sampleCV(get().cv.lang), templateId: get().cv.templateId, accent: get().cv.accent } }),
      importJson: (json) => set({ cv: parseCV(json) }),
    }),
    { name: 'cvlove:v1', version: 1 },
  ),
)
