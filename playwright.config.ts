import { defineConfig } from '@playwright/test'

// E2E_PORT : autre port que 4173 quand un `vite preview` tourne déjà ailleurs (sinon on réutiliserait un build périmé).
const port = Number(process.env.E2E_PORT ?? 4173)
const outDir = process.env.OUT_DIR ?? 'dist'
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  webServer: { command: `pnpm exec vite preview --port ${port} --strictPort --outDir ${outDir}`, url: `http://localhost:${port}`, reuseExistingServer: !process.env.E2E_PORT },
  use: { baseURL: `http://localhost:${port}`, locale: 'fr-FR', acceptDownloads: true },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
