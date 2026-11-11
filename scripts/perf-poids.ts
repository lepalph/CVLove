// Poids et chargement (docs/wiki/poids-chargement.md). Build servi au préalable (avec gzip, comme Vercel) :
//   OUT_DIR=.frozen/poids pnpm build && OUT_DIR=.frozen/poids pnpm exec tsx scripts/serve-dist.ts 4406
//   pnpm exec tsx scripts/perf-poids.ts http://localhost:4406
// Accueil et éditeur (#/edit), CPU ×4, réseau « Fast 3G » (1,6 Mb/s, 150 ms), cache vide. Médiane de RUNS passages.
// Sortie : octets transférés (gzip) et nombre de requêtes jusqu'au PDF affiché, LCP, CLS, temps jusqu'au CV visible.
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:4406'
const runs = Number(process.env.RUNS ?? 3)
const browser = await chromium.launch()
const med = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]

async function run(hash: string) {
  const edit = hash !== ''
  const page = await browser.newPage({ locale: 'fr-FR', viewport: { width: 1440, height: 900 } })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  const files = new Map<string, number>()
  // context : voit aussi les requêtes des workers (render.worker, pdf.worker), que la session CDP de la page ne voit pas
  const pending: Promise<void>[] = []
  page.context().on('requestfinished', (r) => pending.push((async () => {
    if (r.url().startsWith('data:')) return
    // sizes() renvoie ~0 pour les scripts de worker : on recompresse le corps reçu (même niveau gzip que le serveur)
    if (/worker/.test(r.url())) files.set(r.url(), gzipSync(await (await r.response())!.body()).length)
    else { const z = await r.sizes(); files.set(r.url(), z.responseBodySize + z.responseHeadersSize) }
  })()))
  await page.addInitScript(() => {
    const w = window as any
    w.__m = { lcp: 0, cls: 0 }
    new PerformanceObserver((l) => l.getEntries().forEach((e: any) => (w.__m.lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => l.getEntries().forEach((e: any) => !e.hadRecentInput && (w.__m.cls += e.value))).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto(base + '/' + hash, { waitUntil: 'commit' })
  // CV visible : un canvas (PDF rendu) ou l'image pré-rendue du hero, chargée
  // (éditeur : l'aperçu du CV, `[role=img] canvas`, pas une vignette)
  await page.waitForFunction((edit) => !!document.querySelector(edit ? '[role=img] canvas' : 'canvas') || [...document.querySelectorAll<HTMLImageElement>('img')].some((i) => i.complete && i.naturalWidth > 0 && !edit), edit, { timeout: 120_000, polling: 50 })
  const canvas = await page.evaluate(() => performance.now())
  await page.waitForTimeout(3000) // fin des polices et des vignettes proches
  const m = await page.evaluate(() => (window as any).__m)
  await Promise.all(pending)
  await page.close()
  const bytes = [...files.values()].reduce((a, b) => a + b, 0)
  if (process.env.LIST) console.log([...files].sort((a, b) => b[1] - a[1]).map(([u, b]) => `${(b / 1024).toFixed(0)} ko ${u.replace(base, '')}`).join('\n'))
  return { kb: bytes / 1024, req: files.size, lcp: m.lcp, cls: m.cls, canvas }
}

for (const [name, hash] of [['accueil', ''], ['éditeur', '#/edit']] as const) {
  const r: Awaited<ReturnType<typeof run>>[] = []
  for (let i = 0; i < runs; i++) r.push(await run(hash))
  const f = (k: keyof (typeof r)[0], d = 0) => med(r.map((x) => x[k])).toFixed(d)
  console.log(`${name} : ${f('kb')} ko, ${f('req')} requêtes, LCP ${f('lcp')} ms, CLS ${f('cls', 3)}, CV visible ${f('canvas')} ms`)
}
await browser.close()
