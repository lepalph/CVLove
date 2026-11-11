// Mesure de l'aperçu pendant la frappe (docs/wiki/performance-apercu.md). Build servi au préalable :
//   OUT_DIR=.frozen/perf pnpm build && pnpm exec vite preview --outDir .frozen/perf --port 4406 --strictPort
//   pnpm exec tsx scripts/perf-apercu.ts http://localhost:4406
// Parcours : exemple « Informatique » en mode complet, 20 frappes dans « Prénom », CPU ralenti (×1 et ×4), deux rythmes de frappe.
// Sortie : tâches longues du fil principal (PerformanceObserver 'longtask'), latence des frappes (Event Timing, keydown),
// délai entre la dernière frappe et l'aperçu à jour.
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:4406'
const runs = Number(process.env.RUNS ?? 3)
const browser = await chromium.launch()

async function run(cpu: number, delay: number) {
  const page = await browser.newPage({ locale: 'fr-FR', viewport: { width: 1440, height: 900 } })
  await page.goto(base)
  await page.getByRole('link', { name: 'Créer mon CV' }).first().click()
  await page.getByRole('button', { name: 'Complet' }).click()
  await page.getByRole('button', { name: 'Informatique' }).click()
  await page.locator('canvas').first().waitFor({ state: 'attached', timeout: 30_000 })
  await page.waitForTimeout(2000) // premier rendu et polices terminés
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu })
  await page.evaluate(() => {
    const w = window as any
    w.__m = { long: [] as number[], keys: [] as { dur: number; delay: number }[], swaps: [] as number[] }
    new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__m.long.push(e.duration))).observe({ type: 'longtask' })
    new PerformanceObserver((l) => l.getEntries().forEach((e: any) => e.name === 'keydown' && w.__m.keys.push({ dur: e.duration, delay: e.processingStart - e.startTime })))
      .observe({ type: 'event', durationThreshold: 16 } as PerformanceObserverInit)
    const sheet = document.querySelector('[role=img] canvas')!.parentElement!
    addEventListener('keydown', (e) => (w.__m.lastKey = e.timeStamp), true)
    new MutationObserver(() => w.__m.swaps.push(performance.now())).observe(sheet, { childList: true })
  })
  const field = page.getByLabel('Prénom')
  await field.click()
  await field.press('End')
  // Frappes envoyées à heure fixe sans attendre la page (keyboard.type attend l'accusé de chaque touche, donc la fin de la tâche
  // longue en cours, et masquerait l'attente) : comme une vraie personne, qui n'attend pas l'écran pour taper la suivante.
  const t0 = Date.now()
  const sent: Promise<unknown>[] = []
  for (const c of 'Alexandrine-Philippa') { // 20 caractères
    sent.push(cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: c, text: c, unmodifiedText: c }), cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: c }))
    await new Promise((r) => setTimeout(r, delay))
  }
  await Promise.all(sent)
  const typing = Date.now() - t0
  const lastKey = await page.evaluate(() => (window as any).__m.lastKey)
  await page.waitForTimeout(6000 * Math.max(1, cpu / 2)) // laisse finir le dernier rendu
  const m = await page.evaluate((lk: number) => {
    const w = window as any
    return { ...w.__m, fresh: Math.max(0, (w.__m.swaps.filter((s: number) => s > lk).pop() ?? NaN) - lk) }
  }, lastKey)
  await page.close()
  const keys = m.keys.length // Event Timing ne remonte que les frappes > 16 ms : les autres comptent comme 0
  const durs = [...m.keys.map((k: any) => k.dur), ...Array(Math.max(0, 20 - keys)).fill(0)].sort((a, b) => a - b)
  const sum = (a: number[]) => a.reduce((s, x) => s + x, 0)
  return {
    longTotal: Math.round(sum(m.long)), longCount: m.long.length, longMax: Math.round(Math.max(0, ...m.long)),
    keyP50: durs[9], keyMax: Math.round(durs[19]), keySlow: m.keys.filter((k: any) => k.dur > 100).length,
    typing, fresh: Math.round(m.fresh),
  }
}

for (const cpu of [1, 4])
  for (const delay of [120, 400]) {
    const rs: Awaited<ReturnType<typeof run>>[] = []
    for (let i = 0; i < runs; i++) rs.push(await run(cpu, delay))
    const med = (k: keyof (typeof rs)[0]) => rs.map((r) => r[k]).sort((a, b) => a - b)[Math.floor(rs.length / 2)]
    console.log(`CPU x${cpu}, frappe ${delay} ms : tâches longues ${med('longTotal')} ms (${med('longCount')}, max ${med('longMax')} ms) ; ` +
      `frappe p50 ${med('keyP50')} ms, max ${med('keyMax')} ms, ${med('keySlow')}/20 > 100 ms ; saisie ${med('typing')} ms ; aperçu à jour ${med('fresh')} ms après la dernière frappe`)
  }
await browser.close()
