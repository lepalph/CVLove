# Poids et chargement

Écrit le 2026-11-11. Base : `lepalph/CVLove@8f4a55c`. Point de [REPRISE.md](../REPRISE.md), lot 2, « Performance » (hors Web Worker : voir [Performance de l'aperçu](performance-apercu.md)).

## Méthode

`scripts/perf-poids.ts` (Playwright, Chromium). Build servi par `scripts/serve-dist.ts` sur 4406, **avec gzip** (comme Vercel ; le serveur ne compressait pas avant, ce qui aurait faussé toute mesure de poids). Accueil (`/`) puis éditeur (`/#/edit`), cache vide, CPU ×4 (`Emulation.setCPUThrottlingRate`) et réseau « Fast 3G » (1,6 Mb/s, 150 ms), médiane de 3 passages.
- Octets : somme des corps de réponse reçus (compressés), workers compris, jusqu'à 3 s après l'affichage du CV.
- « CV visible » : accueil, premier canvas **ou** image pré-rendue chargée ; éditeur, canvas de l'aperçu (`[role=img] canvas`, pas une vignette).
- LCP et CLS : `PerformanceObserver`. **Limite** : un canvas n'est pas candidat au LCP. Avant, le LCP de l'accueil (1,8 s) était donc le titre, pas le CV ; l'image WebP, elle, est candidate. Le LCP monte mécaniquement quand le CV apparaît tôt sous forme d'image, d'où la colonne « CV visible », la seule comparable.

## Avant (8f4a55c)

Build : 67 fichiers, 8,6 Mo bruts, 3,3 Mo gzip (dont `public/fonts` 3,8 Mo bruts / 1,7 Mo gzip). Plus gros fichiers (brut / gzip) :

| Fichier | Brut | gzip |
|---|---|---|
| `pdf.worker.min-*.mjs` (pdf.js) | 1 264 ko | 374 ko |
| `render.worker-*.js` (react-pdf + modèles) | 1 229 ko | 447 ko |
| `react-pdf.browser-*.js` | 1 199 ko | 438 ko |
| `index-*.js` (appli) | 507 ko | 169 ko |
| `pdf-*.js` (pdf.js) | 430 ko | 127 ko |
| `CVLoveText-*.ttf` (×2) | 379 ko | 149 ko |
| `Montserrat-*.ttf` (×2) | 375 ko | 155 ko |
| `Inter-*.ttf` (×2) | 342 ko | 164 ko |
| `SourceSerif4-*.ttf` (×2) | 330 ko | 106 ko |
| `CVLoveDisplay` / `CVLoveSerif` / Geist / Tajawal | 135 à 195 ko / 60 à 70 ko | 29 à 92 ko |
| `index-*.css` | 34 ko | 8 ko |

Aucune image dans le build : le « PDF de démonstration » de l'accueil est le CV d'exemple du hero, fabriqué dans le navigateur (react-pdf, 438 ko gzip, puis pdf.js 127 ko + son worker 374 ko, puis 4 polices) avant d'être affiché, en série. Le build ne contenait donc aucune image à convertir en WebP : ce point s'est transformé en pré-rendu du hero (voir plus bas).

Ce que charge l'accueil : `index` (169 ko), `react-pdf.browser` (431), `pdf` (126), le worker de pdf.js (368), Inter ×2, CVLoveSerif ×2, Tajawal ×2 (polices du hero), Geist ×2 : 18 requêtes.

| Page | Transféré | Requêtes | LCP | CLS | CV visible |
|---|---|---|---|---|---|
| Accueil | 1 772 ko | 18 | 1 784 ms (le titre) | 0,000 | 10 954 ms |
| Éditeur | 2 923 ko | 32 | 1 724 ms (le titre) | 0,007 | 15 242 ms |

## Décisions, dans l'ordre du gain mesuré

1. **Hero pré-rendu en WebP au build** (gain : accueil 1 772 → 401 ko, CV visible 11,0 → 2,2 s). `scripts/make-vignettes.ts` rend, avec le même code que le PDF téléchargé (`renderPdf`) et pdf.js, la page 1 du CV d'exemple des 4 mises en page du hero × 7 langues : 28 images de 800 px (`@napi-rs/canvas` `encode('webp', 75)`, 30 à 50 ko chacune), dans `public/vignettes/` (non versionné). Lancé par `pnpm build` (≈ 4 s ; sans effet si l'empreinte des sources, `public/vignettes/.stamp`, n'a pas changé). `SamplePage` affiche l'image pour les réglages d'origine ; dès qu'une couleur ou une police est changée, ou si l'image manque (`pnpm dev` sans le script, `onError`), il refait le rendu PDF comme avant. Les vignettes de la grille qui ont la même mise en page (`-1`) en profitent aussi. Aucune nouvelle dépendance (`@napi-rs/canvas` et `tsx` sont déjà là pour `check:pdf`). Risque : le build exige désormais le binaire natif de `@napi-rs/canvas` (présent sur Vercel Linux x64) ; la liste des 4 mises en page vit dans `src/ui/homeLayouts.ts`.
2. **Polices en sous-ensembles** (gain : `public/fonts` 1 671 → 942 ko gzip, −0,73 Mo ; l'éditeur télécharge 4 à 6 polices de moins de 100 ko au lieu de 100 à 165 ko chacune). `scripts/subset-fonts.py` (`uv run --with fonttools`, outil de build, rien dans `package.json`) garde latin, latin étendu, vietnamien, grec, cyrillique, ponctuation, monnaies, et les fonctions OpenType utiles (crénage, ligatures, composition, marques), sans hinting. Les 7 langues restent couvertes (l'arabe passe par Tajawal, inchangé). Ce qui disparaît : les écritures hors de cette liste (ex. cyrillique étendu-B, latin étendu-D). `pnpm check:pdf` : 535/535 rendus valides, ATS, arabe et deux-points OK. Les fichiers sources complets viennent de `scripts/make-fonts.py` ; la sortie de `subset-fonts.py` remplace `public/fonts/*.ttf`.
3. **Vignettes de l'éditeur après l'aperçu** (gain : éditeur, CV visible 14,0 → 9,8 s, mesuré après les points 1 et 2). Les vignettes du panneau Design (`afterPreview`) attendaient en parallèle de l'aperçu, avec react-pdf sur le fil principal (431 ko) et 4 polices : sur 3G elles lui prenaient la bande passante. Elles attendent maintenant que l'aperçu soit peint (`usePreviewPages`), ou 10 s. Effet de bord sur le LCP de l'éditeur : l'image de la première vignette arrive après l'aperçu, donc LCP ≈ CV visible.
4. **`React.lazy` sur Éditeur, Lettre, Mes documents et Mentions** (gain : `index` 507 → 433 ko, 169 → 147 ko gzip, soit −22 ko sur l'accueil). Peu, car l'accueil importe `Guided` et `DesignPanel` (donc le formulaire) ; les pages lazy sont petites (Éditeur 3 ko, Lettre 3, Documents 3, Mentions 7 gzip). Gardé parce que mesurable et sans risque (`Suspense` sans repli : l'écran reste vide le temps d'un chunk de quelques ko).

## Après

Même méthode, médiane de 3 passages.

| Page | Transféré | Requêtes | LCP | CLS | CV visible |
|---|---|---|---|---|---|
| Accueil | 401 ko (−77 %) | 10 | 2 208 ms (l'image) | 0,000 | 2 187 ms (−80 %) |
| Éditeur | 2 155 ko (−26 %) | 28 | ≈ 10 900 ms (l'image, après l'aperçu) | 0,000 | ≈ 9 800 ms (−35 %) |

L'éditeur reste lourd : pdf.js (127 + 368 ko) et le worker de l'aperçu (react-pdf, 439 ko) sont nécessaires avant le premier canvas, soit ≈ 1,3 Mo à 200 ko/s. Pistes non faites : précharger ces fichiers en parallèle dès l'accueil (au survol de « Créer mon CV »), et ne pas charger Tajawal (57 ko) pour un CV sans arabe (touche aux modèles, hors périmètre ici).

Le dossier de build, lui, grossit : 3,8 Mo gzip (104 fichiers) contre 3,3 Mo, à cause des 28 images (≈ 1,3 Mo) que personne ne télécharge en entier (une langue, une mise en page à la fois).

## Non fait, non mesuré

- Pré-rendu des vignettes de toute la grille (84 à 252 images) : sous la ligne de flottaison, elles se chargent déjà à la demande ; pas de gain au premier affichage.
- Appareil réel lent : le CPU ×4 ralentit le fil principal de la page, pas les workers.
- Brotli (Vercel) donne des poids plus bas que le gzip mesuré ici ; les écarts relatifs restent.

## Effets sur les tests et le code existant
- `src/main.tsx` : le focus sur le titre après un changement de page attend désormais le titre de la nouvelle page (chunk chargé à la demande), au lieu de se poser sur l'ancien.
- `boutons` A06 et `lot-c` attendaient un canvas sur l'accueil : le hero est maintenant une image, ils acceptent `img`.
- Suites lancées à la fin : tsc, vitest 230/230, `check:pdf` 535/535, e2e cvlove, boutons, mentions, pages, lot-c : 232 passés (plus filtres-design, p0s, lettre-a11y, apercu-relie, r2a passés avant les derniers correctifs).

## Reprise par le chief of staff (2026-11-11, après `lepalph/CVLove@1cfa0f9`)
- En CI (pull_request), deux tests de Mes documents ont échoué : le focus de « Renommer » perdu (r2a) et le focus de I01 (boutons). En local, le défaut se reproduisait 2 fois sur 16.
- Cause : avec les pages chargées à la demande, le focus du titre est retenté toutes les 50 ms jusqu'à ce que la page soit montée. Si l'utilisateur agit entre-temps (clic sur Renommer), ce focus tardif lui prend le champ.
- Correctif (`src/main.tsx`) : le titre ne prend le focus que si le focus n'a pas bougé depuis le changement de page. 36 passages sur 36, suite complète 239 passés (1 ignoré).
