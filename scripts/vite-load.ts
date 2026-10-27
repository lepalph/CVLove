// Charge les sources de src/ dans Node avec le même pipeline que le navigateur (Vite SSR) :
// c'est ce qui fait marcher `import.meta.glob` (registre des modèles) dans check:pdf et les autres scripts.
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { layoutMeta } from '../vite-layout-meta'

export async function startLoader() {
  const vite = await createServer({
    configFile: false,
    plugins: [layoutMeta()],
    root: fileURLToPath(new URL('..', import.meta.url)),
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true },
  })
  return { load: <T = any>(path: string) => vite.ssrLoadModule(path) as Promise<T>, close: () => vite.close() }
}
