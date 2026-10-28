# Audit de sécurité CVLove v2 (lecture seule, 2026-10-28)

Méthode : lecture du code, `pnpm audit`, build copié hors dépôt, scan du bundle, tests Playwright (Chromium) avec et sans CSP.
Bilan : 0 Critique, 0 Élevé, 3 Moyen, 3 Faible, plusieurs Info (points sains).

## Peut-on récupérer les données d'une autre personne ? Non, pas à distance
- Aucune requête sortante : le bundle ne contient aucune URL de service (seulement xmlns, licences de polices, liens GitHub dans des `<a>`), aucun `fetch` vers l'extérieur, aucune télémétrie ni CDN. Le worker pdf.js est servi par la même origine (`PdfCanvas.tsx:7`, `?url` => `assets/pdf.worker.min-*.mjs`), polices dans `public/fonts` (`index.html:10`).
- Les données vivent dans `localStorage['cvlove:v2']` (`store.ts:95`), isolé par origine : sans serveur, personne n'a de point d'entrée pour lire celui d'un autre.
- Rien dans l'URL : le hash ne porte que la vue (`App.tsx:8`). Blobs PDF/JSON révoqués après 10 s (`Editor.tsx:34`).
- Previews Vercel : chaque déploiement a son sous-domaine (`*.vercel.app`), donc son propre localStorage : pas de partage avec la prod. Les domaines `vercel.app` sont sur la Public Suffix List.
- Risques résiduels réels : XSS (aucune trouvée), extension de navigateur, session partagée, ou fichier JSON piégé reçu (voir M2).

## Moyen
**M1. Aucun en-tête de sécurité** (pas de `vercel.json`). Un XSS futur ou une dépendance compromise pourrait exfiltrer le localStorage librement ; l'app peut être mise en iframe (clickjacking). Correctif : le `vercel.json` ci-dessous. Testé : avec cette CSP, aperçu (4 canvas), téléchargement PDF et rendu photo fonctionnent, zéro violation.

**M2. Import JSON : la photo n'est pas validée, d'où un appel réseau** (`documents.ts:34`, `types.ts:55`, rendu `Form.tsx:80` et `<Image src>` des layouts, ex. `classique.tsx:84`). react-pdf fait `fetch(src)` sur n'importe quelle URI (`react-pdf.browser` : `rA=fetch(e.uri)`). Scénario : on envoie un JSON "CV exemple" avec `photo:"https://evil.tld/p.gif?x"`; à l'import, l'aperçu appelle evil.tld (IP, horaire, UA de la victime). Preuve : sans CSP, mon serveur témoin reçoit `GET /pixel.png?victim=1` ; avec la CSP ci-dessous (`img-src 'self' data:`, `connect-src 'self' data:`) c'est bloqué. Cela contredit la promesse "100 % local" tant que la CSP n'est pas posée.
Correctif minimal, dans `parseImport` : `photo: /^data:image\/(jpeg|png|webp);base64,/.test(p) ? p : ''` pour chaque CV importé (et à la lecture du store, voir M3).

**M3. Validation de schéma trop faible, donc état persistant empoisonné** (`cv.ts:103` `isCVData` ne teste que 3 tableaux ; `documents.ts:32` accepte une lettre si `x.data` est truthy ; `store.ts:104` relit le localStorage sans contrôle). Preuves (injection dans localStorage, rechargement) : `lang:'xx'`, `fields[0].value:42`, `items:[null]`, `fontPair:'zz'` font échouer le rendu (TypeError dans `theme.ts`/`visibleFields`/`visibleSections`) : aperçu et PDF cassés, et l'état est conservé après rechargement ; l'utilisateur doit vider le localStorage à la main. `templateId` inconnu et `accent` hostile sont sans effet. Aucun ErrorBoundary (`main.tsx`). Scénario : un JSON piégé ou corrompu rend l'éditeur inutilisable. Correctif : un `sanitizeCV(d)` (lang dans `LANGS`, chaînes forcées par `String()`, items objets, enums de `Design` avec repli sur `DEFAULT_DESIGN`) appelé par `parseImport` et par `getItem`, plus un `try/catch` qui retombe sur l'exemple.

## Faible
**F1. Pas de limite de taille à l'import ni à la photo** (`Documents.tsx:23`, `Form.tsx:26` `f.text()`, `Form.tsx:261` `createImageBitmap(file)`). Un JSON de plusieurs centaines de Mo ou une image géante bloque l'onglet (déni de service local, auto-infligé) ; un dépassement de quota localStorage échoue sans message. Correctif : refuser `file.size > 5_000_000` pour le JSON, `> 15_000_000` pour l'image, et un `try/catch` dans `onPhoto` (aujourd'hui rejet non géré si le fichier n'est pas une image).
**F2. Photo.** `accept="image/*"` n'est qu'un filtre d'interface, mais l'image est décodée puis ré-encodée en JPEG par canvas (`Form.tsx:261-270`) : un SVG avec script est au pire rejeté, jamais exécuté ; les EXIF (GPS) sont supprimés (bon point). Le type MIME annoncé est ignoré, seul le décodage compte. Défaut mineur : un PNG transparent devient noir (pas de fond blanc avant `drawImage`).
**F3. Hygiène de build.** Ni `packageManager` ni `.npmrc` : version de pnpm non épinglée. Ajouter `"packageManager": "pnpm@12.15.0"` et un délai minimal de publication (`minimumReleaseAge`) limite les attaques par publication frauduleuse récente. Pas de CI (`.github` absent) : lancer `pnpm audit --prod` à chaque déploiement.

## Info (points sains vérifiés)
- Rendu React : aucun `dangerouslySetInnerHTML`, `innerHTML`, `eval`. Seuls `href` dynamiques : `GITHUB_URL` constant et ancres `#/…`. Aucun href construit depuis les données utilisateur.
- PDF : aucun `<Link>` react-pdf, donc le site web et l'e-mail sont du texte simple : pas de `javascript:` ni de `mailto:` injectable. Métadonnées : seulement `title` et `author` = nom saisi (échappés par pdfkit, `layouts/*.tsx`), producteur par défaut react-pdf. Nom de fichier slugifié (`cv.ts:96`).
- Couleur d'accent hostile (`url(http://…)`) : testée, sans effet réseau ni plantage (react-pdf l'ignore, `<input type=color>` rejette).
- `__proto__` dans un JSON importé : `JSON.parse` crée une propriété propre, le spread la copie sans toucher le prototype ; pas de pollution (aucun `Object.assign` vers cible partagée ni `merge` récursif).
- Dépendances : `pnpm audit` et `--prod` : aucune vulnérabilité connue. 5 dépendances de prod (react, react-dom, zustand, @react-pdf/renderer, pdfjs-dist), toutes utilisées. `@napi-rs/canvas`, `playwright`, `tsx` : dev uniquement (script `check:pdf`/e2e). Aucun paquet du lockfile n'a de script d'installation (`requiresBuild` absent).
- Dépôt : 6 commits, auteur `noreply`, aucun `.env`, clé, image ou PDF suivi ; seules données personnelles = exemples fictifs (`example.com`, `exemple.fr`, `src/model/sample.ts`). `.gitignore` couvre `*.local`.
- Cache : aucun service worker ; les données ne transitent jamais, donc rien à fuiter par cache HTTP.

## vercel.json proposé (testé sur le build)
```json
{
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "Content-Security-Policy", "value": "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' data:; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "no-referrer" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
      { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" }
    ] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```
Pourquoi chaque directive est nécessaire (vérifié en conditions réelles) : `'wasm-unsafe-eval'` pour le WebAssembly de react-pdf/pdf.js ; `connect-src data:` car react-pdf charge son wasm via `fetch(data:…)` (sans cela : "Buffer is not defined", aperçu cassé, constaté) ; `worker-src 'self'` pour le worker module pdf.js ; `img-src data:` pour la photo et l'icône ; aucun `blob:` requis (le PDF est téléchargé via un lien `blob:` de navigation, non soumis à la CSP) ; aucun `unsafe-inline` (React pose les styles via le CSSOM). `frame-ancestors` n'existe qu'en en-tête, d'où ce fichier. Si une future fonction charge des polices ou images externes, la CSP la bloquera : c'est voulu. Pas de `rewrites` : le routage est par hash.
