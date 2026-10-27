import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  webServer: { command: 'pnpm preview', url: 'http://localhost:4173', reuseExistingServer: true },
  use: { baseURL: 'http://localhost:4173', locale: 'fr-FR', acceptDownloads: true },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
