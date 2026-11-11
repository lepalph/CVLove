# Performance de l'aperçu pendant la frappe

Écrit le 2026-11-11. Base : `lepalph/CVLove@3ce1500`. Point de [REPRISE.md](../REPRISE.md), lot 2, « Performance » : l'aperçu de l'éditeur génère le PDF sur le fil principal à chaque pause de frappe.

## État trouvé

- `PreviewPane` (`src/ui/EditorParts.tsx`) donne à `PdfCanvas` un rendu différé de 300 ms (`debounce={300}`) ; un nouveau rendu annule le précédent côté pdf.js, mais la fabrication du PDF (`renderLazy` → `renderPdf`, react-pdf + fontkit) tourne dans le fil principal et ne s'interrompt pas.
- pdf.js a déjà son worker (`pdf.worker.min.mjs`) ; seul react-pdf bloquait.

## Mesure

Script `scripts/perf-apercu.ts` (Playwright, build de production servi sur 4406). Parcours : accueil → « Créer mon CV » → « Complet » → exemple « Informatique », puis 20 frappes à la fin de « Prénom ». Les frappes partent à heure fixe sans attendre la page (CDP `Input.dispatchKeyEvent` non attendu) : `keyboard.type` de Playwright attend l'accusé de chaque touche, donc la fin de la tâche longue en cours, et cachait l'attente (0 frappe lente à la première mesure).
- Tâches longues : somme, nombre et maximum des entrées `PerformanceObserver('longtask')` pendant la saisie et jusqu'à 6 s (×1) ou 12 s (×4) après.
- Latence d'une frappe : durée Event Timing de `keydown` (de l'arrivée de la touche à l'image suivante) ; les frappes de moins de 16 ms ne sont pas remontées et comptent pour 0.
- Aperçu à jour : délai entre la dernière frappe et le dernier remplacement des canvas.
- Deux rythmes : 120 ms entre deux touches (le rendu n'a lieu qu'après la dernière) et 400 ms (une pause de plus de 300 ms à chaque touche, donc un rendu par touche, et la touche suivante tombe dessus). CPU ×1 (Mac Apple Silicon) et ×4 (`Emulation.setCPUThrottlingRate`, appareil lent). Médiane de 3 passages.

| Cas | Tâches longues avant | après | Frappe p50 / max avant | après | Frappes > 100 ms avant | après | Aperçu à jour avant | après |
|---|---|---|---|---|---|---|---|---|
| ×1, 120 ms | 0 ms | 0 ms | 16 / 32 ms | 16 / 32 ms | 0/20 | 0/20 | 456 ms | 448 ms |
| ×1, 400 ms | 461 ms (8, max 62) | 0 ms | 16 / 40 ms | 16 / 40 ms | 0/20 | 0/20 | 517 ms | 434 ms |
| ×4, 120 ms | 142 ms (1, max 142) | 0 ms | 24 / 48 ms | 24 / 48 ms | 0/20 | 0/20 | 663 ms | 500 ms |
| ×4, 400 ms | 1 997 ms (16, max 154) | 0 ms | 64 / 136 ms | 40 / 40 ms | 6/20 | 0/20 | 649 ms | 503 ms |

Lecture : avant, chaque rendu coûtait une tâche longue d'environ 150 ms au fil principal à CPU ×4 ; une frappe sur trois qui tombait dessus attendait plus de 100 ms. Après, plus aucune tâche longue : ce qui reste dans le fil principal (peinture des canvas par pdf.js, React) est découpé en morceaux de moins de 50 ms.

Limite de la mesure : `Emulation.setCPUThrottlingRate` ralentit le fil principal de la page, pas le worker. La colonne « aperçu à jour, après » à ×4 est donc optimiste (le rendu dans le worker n'y est pas ralenti). Les colonnes tâches longues et frappes, elles, mesurent bien le fil principal.

## Décision

- **Le PDF de l'aperçu est fabriqué dans un Web Worker** (`src/pdf/render.worker.ts`, module worker de Vite : `new Worker(new URL(...), { type: 'module' })`). react-pdf 4.9 tourne tel quel dans un worker : son build navigateur n'utilise `window` que dans un assistant de téléchargement que nous n'appelons pas ; fontkit charge les polices par `fetch` (URL `/fonts/…`, absolue, donc valable depuis le worker) ; le registre `import.meta.glob` et `?meta` est repris par `worker.plugins` dans `vite.config.ts`. `worker.format: 'es'` : les modèles sont chargés à la demande (`import()`), ce que le format `iife` par défaut refuse. Aucune dépendance ajoutée.
- `src/pdf/lazy.ts` : `previewLazy` / `previewLetterLazy` (éditeur de CV et de lettre). Un rendu à la fois ; seule la dernière demande attend son tour, celles qui sont remplacées ou dont le `signal` de `PdfCanvas` est levé sont abandonnées (`AbortError`, ignorée par `PdfCanvas`). Un rendu commencé dans le worker n'est pas interrompu (react-pdf est synchrone) : son résultat est jeté. Tuer et relancer le worker l'interromprait, mais ferait reparser les polices à chaque frappe.
- Repli : pas de `Worker`, ou script du worker qui ne se charge pas (`onerror`) → rendu sur le fil principal comme avant. Une erreur de rendu dans le worker (police introuvable…) remonte comme avant : alerte de l'aperçu.
- **Le téléchargement ne change pas** : il appelle toujours `renderLazy` dans le fil principal, même code, même fichier. `pnpm check:pdf` : 499/499. Les vignettes de l'accueil (`SamplePage`) restent aussi sur le fil principal (hors périmètre).
- En dev seulement, `src/pdf/worker-dev.ts` pose `window = globalThis` dans le worker : le runtime de React Refresh (`/@react-refresh`, importé par chaque `.tsx`) écrit dans `window` au chargement et faisait échouer le rendu (« window is not defined »). Rien dans le build (même empreinte du fichier du worker avec et sans).

## Coûts et limites

- Le worker embarque sa propre copie de react-pdf et des modèles (`render.worker-*.js`, 1,2 Mo non compressé). Le premier téléchargement du PDF recharge et prépare aussi react-pdf et les polices dans le fil principal (avant, l'aperçu l'avait déjà fait) : il est un peu plus lent la première fois.
- Le test `lettre-a11y` « échec du PDF : une seule alerte » coupait `**/assets/render-*.js` ; il coupe maintenant `**/assets/render*.js`, pour que l'aperçu (worker) échoue aussi. Il passe donc par le repli worker → fil principal.
- Non mesuré : un vrai appareil lent (le ralentissement CPU de Chromium ne touche pas le worker), Firefox et Safari (module workers pris en charge depuis Firefox 114 et Safari 15).
- `panel-p1` « sommaire collant » échoue déjà sur `3ce1500` (défilement du volet), sans lien avec ce changement.
