import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { layoutMeta } from './vite-layout-meta.ts'

export default defineConfig({
  plugins: [layoutMeta(), react(), tailwindcss()],
  // OUT_DIR : un build par agent (avec E2E_PORT) pour lancer des builds et des e2e en parallèle sans partager dist/.
  build: { outDir: process.env.OUT_DIR ?? 'dist' },
  // Worker de l'aperçu (src/pdf/render.worker.ts) : module ES, car il charge les modèles à la demande (import()), et même registre `?meta`.
  worker: { format: 'es', plugins: () => [layoutMeta(), react()] },
  test: { include: ['src/**/*.test.ts'] },
})
