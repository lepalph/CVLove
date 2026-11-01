// Sert dist/ (ou OUT_DIR) avec les en-têtes de vercel.json (sans dépendance) : pour tester la CSP en local.
// Usage : tsx scripts/serve-dist.ts [port]   (port 0 ou absent : libre ; affiche « port N »)
import { readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL(`../${process.env.OUT_DIR ?? 'dist'}/`, import.meta.url))
const rules: { source: RegExp; headers: { key: string; value: string }[] }[] = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).headers.map((h: any) => ({ ...h, source: new RegExp(`^${h.source}$`) }))
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.wasm': 'application/wasm', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
}

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname)
  for (const r of rules) if (r.source.test(path)) for (const h of r.headers) res.setHeader(h.key, h.value)
  let file = join(root, normalize(path).replace(/^(\.\.[/\\])+/, ''))
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html')
    res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
    res.end(readFileSync(file))
  } catch {
    res.statusCode = 404
    res.end('Not found')
  }
})
server.listen(Number(process.argv[2] ?? 0), () => console.log(`port ${(server.address() as { port: number }).port}`))
