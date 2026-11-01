# Vérification de la note de reprise

Date : 2026-11-02. Commit vérifié : `lepalph/CVLove@d75f031` (branche `fix/sections-niveaux-photo`). Poste : Mac (Apple Silicon), pas WSL. Cible : [REPRISE.md](../REPRISE.md).

## Résultats des 4 commandes (au commit d75f031)

| Commande | Résultat |
|---|---|
| `OUT_DIR=.frozen/verif pnpm build` | OK (`tsc --noEmit` puis `vite build`, 575 ms). Un avertissement : chunk `react-pdf.browser` de 1 199 kB (443 kB gzip). |
| `pnpm test` | 119/119, 7 fichiers, 287 ms. |
| `pnpm check:pdf` | 499/499 rendus valides (28 s), puis `check:pdf:b` OK (ATS, pagination, arabe, deux-points, liens). |
| `OUT_DIR=.frozen/verif E2E_PORT=4311 pnpm test:e2e` | **50 passés, 1 échec** sur 51 (1,4 min). Échec : `tests/e2e/lot-c.spec.ts:18` « parcours complet sous CSP ». Reproduit 2 fois en isolé (3 passés, 1 échec à chaque fois). Chromium headless shell installé avant. |

Cause de l'échec : `scripts/serve-dist.ts:8` sert toujours `dist/` (`new URL('../dist/', …)`) et ignore `OUT_DIR`. Avec `OUT_DIR=.frozen/verif`, `dist/` n'existe pas dans le worktree : la page répond « Not found » et le `canvas` n'apparaît jamais (`lot-c.spec.ts:29`). Le test passe sans doute avec `dist/` (non lancé ici). Le commit `d75f031` a ajouté `OUT_DIR` à `vite.config.ts:9` et `playwright.config.ts`, mais pas à `serve-dist.ts`.

## Affirmations de REPRISE.md

Verdicts : vrai, faux, dépassé, invérifiable.

### Contexte, environnement

| Affirmation | Verdict | Preuve |
|---|---|---|
| Pile : React 19, Vite 8, Tailwind 4, zustand 5, TypeScript, pnpm 12 | vrai | `package.json` : react ^19.3.1, vite ^8.3.5, tailwindcss ^4.3.3, zustand ^5.0.16, `packageManager` pnpm@12.15.0 |
| 36 modèles | vrai | 12 fichiers dans `src/templates/layouts/`, 3 styles chacun ; `src/templates/registry.ts:8` génère un modèle par style |
| 7 langues dont l'arabe, écrit de droite à gauche | vrai | `src/model/types.ts:1` (`fr en es de it pt ar`) ; `src/App.tsx:29` pose `dir="rtl"` |
| Lettre de motivation assortie | vrai | `src/templates/letters/` (3 modèles), `src/model/letter.ts` |
| Tests : Vitest, Playwright, `check:pdf` ; déploiement Vercel | vrai | `package.json` scripts ; `vercel.json` présent. Le déploiement à chaque push sur `main` n'est pas testable ici. |
| Tout reste dans le navigateur, pas de serveur ; promesse « Everything stays on your device » | vrai | `README.md:23` |
| Environnement : Ubuntu 24.04 sous WSL2 | **faux pour ce poste** | Ce poste est un Mac (Darwin 24.6, macOS). |
| Compte `gh` actif : `palphconsultant` | **faux pour ce poste** | `gh auth status` : seul `lepalph` est connecté et actif. |
| Préfixer `gh` par `GH_TOKEN=$(gh auth token --user lepalph)` | **dépassé ici** | Inutile quand `lepalph` est le seul compte. La commande marche quand même. |
| Projets dans `~/code`, zsh, réponses en français | vrai | Poste : `~/code/cvlove`, zsh. |

### Où on en est

| Affirmation | Verdict | Preuve |
|---|---|---|
| Branche `fix/sections-niveaux-photo` poussée, PR #1 ouverte, pas mergée | vrai | `gh pr view 1` : état `OPEN` ; `origin/fix/sections-niveaux-photo` existe |
| Site en ligne sur `main`, sans ces changements | invérifiable | Site non consulté. |
| Dernière vérification : build OK | vrai | Build OK au commit d75f031 |
| `pnpm test` 119/119 | vrai | Sortie ci-dessus |
| `pnpm check:pdf` 499/499 (ATS comprise) | vrai | Sortie ci-dessus |
| `pnpm test:e2e` 51/51 | **dépassé** | 51 tests au total, mais 50 passent et `lot-c` échoue avec `OUT_DIR` (voir plus haut). |
| « La PR #1 contient 3 commits » | **dépassé** | `gh pr view 1` : 4 commits. `main..HEAD` : 5 commits (57dcb7f, 326441a, 000aef6, fd3c8c1, d75f031). Les deux derniers sont des commits de docs et d'outillage. |

### Remise en route

| Affirmation | Verdict | Preuve |
|---|---|---|
| `pnpm install` puis `pnpm exec playwright install chromium-headless-shell` pour `test:e2e` | vrai | Les deux commandes ont servi telles quelles. |
| `SPEC.md` et `CONTRIBUTING.md` existent | vrai | Présents à la racine. |

### Contenu de la PR #1

| Affirmation | Verdict | Preuve |
|---|---|---|
| Niveaux en « Texte » toujours affichés | vrai | `src/templates/shared.tsx:120` (`mode === 'text'` rend `labels.levels[level - 1]`) |
| Un seul bouton « Ajouter une section », types absents seulement | vrai | `src/ui/Form.tsx:190-195` (`addable`) |
| Silhouette dans les vignettes « avec photo » : `src/ui/samplePhoto.ts` | vrai | `samplePhoto.ts:2` (`SAMPLE_PHOTO`) |
| `draft: true`, `isBlankDraft` dans `src/store.ts` | vrai | `store.ts:48` |
| Un CV vierge n'est ni listé ni écrit dans `localStorage` | vrai | `store.ts:199` (`partialize` filtre `isBlankDraft`), `store.ts:51` |
| Un CV vierge n'est pas exporté | invérifiable | Non relu (`exportDocs` dans `src/model/documents.ts`). |
| Un CV s'enregistre dès la première saisie, photo ou choix de design | vrai | `store.ts:114-115` (`draft` retiré dès que le contenu ou le design change) |
| Tout document est supprimable ; bouton « Effacer toutes mes données » | vrai | `src/ui/Documents.tsx:82`, `:158` ; `src/i18n/v2.ts:72` |
| Bouton « Enregistrer » manuel retiré | vrai | Aucun bouton de ce type dans `src/ui`. |
| Menu Fichier dans l'en-tête de l'éditeur (export, import JSON) | vrai | `src/ui/EditorParts.tsx:30` (`FileMenu`) |
| Import : « Ajouter comme nouveau document » par défaut, « Remplacer », « Annuler » | vrai | `EditorParts.tsx:95-98` ; l'ajout est le bouton primaire et reçoit le focus |
| « Remplacer » seulement si un seul document du même type et document en cours non vide | **partiellement faux** | `EditorParts.tsx:58-59` : la condition « non vide » ne teste que le CV (`doc.kind === 'cv' && isEmptyCV`). Une lettre vide se voit proposer « Remplacer ». |
| Plusieurs onglets : relecture sur `storage`, `merge` et `sync` dans `store.ts` | vrai | `store.ts:183` (`merge`), `:238` (`sync`), `:246` (`addEventListener('storage')`) |
| Limite `shortcut:` : deux onglets à moins de 500 ms peuvent perdre un document neuf | vrai | `store.ts:190` |
| Un CV ou une lettre vide ne se télécharge plus en PDF blanc | vrai | `src/ui/Editor.tsx:51`, `src/ui/LetterEditor.tsx:42` |
| Un CV vierge suit la langue de l'interface | vrai | `store.ts:57` (`alignBlank`), `:125` (`setUiLang`) |
| « Créer mon CV » crée un nouveau CV si le CV en cours est rempli | vrai | `src/ui/Home.tsx:38-41` |
| File de rendu des vignettes, debounce 400 ms des couleurs, cache LRU dans `SamplePage.tsx` | vrai | `src/ui/SamplePage.tsx:10` (LRU), `:43` (file), `:56` (400 ms) |
| Polices préchargées par famille dans `src/pdf/render.tsx` | vrai | `render.tsx:21` (`warm(lang, pair)`) |
| Mesures : clic couleur 16 s → 1,7 s ; catalogue 60 s → 13,8 s | invérifiable | Mesures de session, non rejouées. |
| Accessibilité : annonces, focus, 320 px, cibles 44 px, contraste forcé, `autocomplete` | invérifiable | Pas relu en détail. Des cibles `min-w-11` existent (`EditorParts.tsx:193`). Les e2e passent sauf `lot-c`. |
| Photo importée : PNG ou JPEG bien formé, 4000 px au plus ; `imageSize`, `cleanPhoto` dans `sanitize.ts` | vrai | `sanitize.ts:25` (`MAX_PHOTO_SIDE = 4000`), `:31`, `:63` ; tests `src/model/lotc.test.ts:58` |
| Texte importé plafonné à 300 000 caractères | vrai | `sanitize.ts:70` (`MAX_DOC_TEXT = 300_000`) |
| Liens `mailto:` validés | vrai | `src/templates/shared.tsx:47` (regex, pas de `?bcc=`). Le fichier n'est pas `sanitize.ts`. |
| `minimumReleaseAge: 4320` | vrai | `pnpm-workspace.yaml:5` |
| Photos de l'éditeur ré-encodées en JPEG | vrai | `lot-c.spec.ts` attend `img[src^="data:image/jpeg"]` |

### Reste à faire

| Affirmation | Verdict | Preuve |
|---|---|---|
| Un exemple chargé est enregistré et listé comme un vrai CV | vrai | `store.ts:131` (`loadSample` via `patchActive`), `:115` (le brouillon perd `draft`) |
| Aucun indicateur « Enregistré », pas de `navigator.storage.persist()` | vrai | `rg "storage.persist"` : aucun résultat dans `src/` |
| Une lettre vide ne suit pas la langue de l'interface | vrai | `store.ts:57` : `alignBlank` ne traite que `d.kind === 'cv'` |
| L'alerte « document vide » n'est pas retraduite au changement de langue | invérifiable | Non testé. |
| Accessibilité mineure (live regions, double annonce, étiquette « exemple », allemand à 401 px) | invérifiable | Non testé. |
| Un « × » efface une section sans confirmation | vrai | `src/ui/Form.tsx:255` (`removeSection` sans `confirm`) |
| CECRL (A1 à C2), un niveau par compétence | vrai (reste à faire) | Aucun CECRL dans `src/` ; `level?: number` de 1 à 5 (`src/model/types.ts:39`) |
| Mes documents : tri par date, état vide, noms « CV » et « Lettre » traduits | vrai (reste à faire) | Pas de `sort(` dans `src/ui/Documents.tsx` ; `store.ts:138` (`'Lettre'`) et `:159` (`'CV'`) en dur |
| Page « Mentions et confidentialité » | vrai (reste à faire) | Aucun libellé « mentions » ou « LCEN » dans `src/` |
| Aperçu : PDF à chaque pause de frappe sur le fil principal | vrai | Seul le worker de pdf.js existe (`src/pdf/PdfCanvas.tsx:8`) |
| Routes sans `React.lazy` | vrai | Aucun `lazy(` dans `src/` hors `src/pdf/lazy.ts` (import dynamique du rendu PDF) |
| Sections manquantes (certifications, bénévolat, publications) | vrai | `src/model/types.ts:4-6` : 8 types, aucun de ces trois |
| `dir="auto"` sur les champs de saisie | vrai (reste à faire) | Aucun `dir="auto"` dans `src/ui` (seulement dans le PDF, `src/templates/shared.tsx:21`) |
| Vignettes en WebP au build, polices en sous-ensembles | invérifiable | Pas de script WebP dans `scripts/`. Polices TTF complètes (`src/pdf/fonts.ts:3`). |

### Méthode de travail

| Affirmation | Verdict | Preuve |
|---|---|---|
| Les agents ne lancent ni `pnpm build` ni `pnpm test:e2e` (`dist/` et port 4173 partagés) | **dépassé** | Depuis `d75f031`, `OUT_DIR` et `E2E_PORT` isolent le build et le port ([Builds parallèles](environnement-builds-paralleles.md)). Exception : `serve-dist.ts` (voir plus haut). |
| Sous-agents en Sonnet ou Haiku, fichiers disjoints | vrai | Repris dans [Règles des agents](regles-agents.md). |
| Commits en Conventional Commits, en français | vrai | `git log` : tous les messages suivent ce format. |

## Écarts à corriger

Bilan : 7 affirmations fausses ou dépassées (2 fausses pour ce poste, 1 inutile ici, 3 dépassées, 1 partiellement fausse) et 8 invérifiables.

1. **`test:e2e` n'est pas 51/51 avec `OUT_DIR`.** `scripts/serve-dist.ts:8` ignore `OUT_DIR` et sert `dist/`, donc `lot-c.spec.ts` échoue dès que le build n'est pas dans `dist/`. À corriger dans le code : lire `process.env.OUT_DIR ?? 'dist'`. Dans REPRISE.md, remplacer « 51/51 » par le chiffre du commit corrigé.
2. **Section « Environnement de l'auteur ».** WSL2 et `palphconsultant` sont faux sur ce Mac : `gh` actif = `lepalph`, macOS Apple Silicon, Kitty. Mettre une section par poste, datée, ou retirer l'OS.
3. **PR #1 : « 3 commits ».** La PR en compte 4 sur GitHub et la branche 5 (`fd3c8c1` docs, `d75f031` outillage). Écrire le nombre avec le commit.
4. **« Les agents ne lancent ni build ni e2e ».** Remplacer par la consigne `OUT_DIR` + `E2E_PORT` (wiki), après la correction du point 1.
5. **Condition de « Remplacer » à l'import.** Préciser que la lettre vide se voit aussi proposer « Remplacer », ou aligner le code (`EditorParts.tsx:58`) sur la note.
6. **Chemin de `mailto:`.** La validation est dans `src/templates/shared.tsx:47`, pas dans `sanitize.ts`. Mineur.
7. **Dater les chiffres.** « Dernière vérification, avant le commit 000aef6 » ne dit rien du commit courant. Ajouter le sha et la date de chaque mesure.
