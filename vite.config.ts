import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { layoutMeta } from './vite-layout-meta.ts'

export default defineConfig({
  plugins: [layoutMeta(), react(), tailwindcss()],
  // OUT_DIR : un build par agent (avec E2E_PORT) pour lancer des builds et des e2e en parallèle sans partager dist/.
  build: { outDir: process.env.OUT_DIR ?? 'dist' },
  test: { include: ['src/**/*.test.ts'] },
})
