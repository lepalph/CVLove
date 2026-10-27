import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { layoutMeta } from './vite-layout-meta.ts'

export default defineConfig({
  plugins: [layoutMeta(), react(), tailwindcss()],
  test: { include: ['src/**/*.test.ts'] },
})
