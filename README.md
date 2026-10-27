# CVLove

Free, open source résumé builder in the spirit of iLovePDF: pick a template, fill in your details, download a PDF. No account, no ads.

**Everything stays on your device.** There is no backend.

- Your data lives in your browser's `localStorage` (key `cvlove:v1`) and nowhere else.
- The PDF is generated in the browser with `@react-pdf/renderer`. The live preview is that same PDF, drawn with pdf.js.
- The server (static hosting) only serves the app's files. The app makes no request that carries your data, and the end-to-end tests fail if the app contacts any host other than localhost.
- Photos are resized in the browser and stored as a data URL. Fonts are self-hosted.
- Export and import of your résumé is a plain JSON file you keep.

## Features

- Template gallery with real previews, switchable without losing data; 5 accent colors
- Live PDF preview, download as `CV-FirstName-LastName.pdf`
- Personal details with optional photo, hideable or custom fields
- Sections: profile, experience, education, skills, languages, projects, interests, free section; add, hide, rename, reorder
- JSON export / import, sample data, "clear everything"
- Works on mobile (Edit / Preview tabs)

## Languages

Résumé language and interface language are independent: French, English, Spanish, German, Italian, Portuguese, Arabic (right-to-left layout). Changing the résumé language changes labels and date formats, never what you typed.

## Run locally

```sh
pnpm install
pnpm dev            # http://localhost:5173
pnpm test           # unit tests (Vitest)
pnpm check:pdf      # renders every template x language, checks text, PNGs in out/
pnpm test:e2e       # builds, serves the preview, runs Playwright (Chromium)
```

First e2e run: `pnpm exec playwright install chromium`.

## Add a template

1. Create `src/templates/<id>.tsx` exporting `Component`, which receives `{ cv, labels }` (see `TemplateProps` in `src/templates/types.ts`) and renders a react-pdf `<Document>` (A4). `classique.tsx` is a working example.
2. Add one entry (`id`, `name` per language, `load: () => import('./<id>')`) to the registry `src/templates/index.ts`.
3. Run `pnpm check:pdf`: every language, including Arabic RTL, must render.

## Fonts

Fonts are in `public/fonts`, under the SIL Open Font License 1.1 (license texts next to them): Inter (`OFL-Inter.txt`), Lora, renamed "CVLove Serif" as its Reserved Font Name requires (`OFL-Lora.txt`), Tajawal for Arabic (`OFL-Tajawal.txt`). The code is MIT.

## Deploy on Vercel

Import the GitHub repository in Vercel. The Vite preset is detected (build `pnpm build`, output `dist`); no configuration needed.

## License

MIT, see `LICENSE`.

---

# CVLove (français)

Générateur de CV gratuit et open source, dans l'esprit d'iLovePDF : on choisit un modèle, on remplit, on télécharge le PDF. Pas de compte, pas de publicité.

**Tout reste sur votre appareil.** Il n'y a pas de backend.

- Vos données sont dans le `localStorage` de votre navigateur (clé `cvlove:v1`), nulle part ailleurs.
- Le PDF est généré dans le navigateur avec `@react-pdf/renderer`. L'aperçu est ce même PDF, affiché avec pdf.js.
- Le serveur (hébergement statique) ne fait que servir les fichiers de l'application. Elle n'envoie aucune requête contenant vos données, et les tests de bout en bout échouent si elle contacte un autre hôte que localhost.
- Les photos sont réduites dans le navigateur et gardées en data URL. Les polices sont auto-hébergées.
- L'export / import de votre CV est un simple fichier JSON, que vous gardez.

## Fonctionnalités

- Galerie de modèles avec vrais aperçus, changement de modèle sans perte de données, 5 couleurs d'accent
- Aperçu PDF en direct, téléchargement sous `CV-Prenom-Nom.pdf`
- Infos personnelles avec photo facultative, champs masquables ou libres
- Sections : profil, expérience, formation, compétences, langues, projets, centres d'intérêt, section libre ; ajout, masquage, renommage, réordonnancement
- Export / import JSON, données d'exemple, « Tout effacer »
- Utilisable sur mobile (onglets Modifier / Aperçu)

## Langues

La langue du CV et celle de l'interface sont indépendantes : français, anglais, espagnol, allemand, italien, portugais, arabe (mise en page de droite à gauche). Changer la langue du CV change les libellés et le format des dates, jamais votre texte.

## Lancer en local

```sh
pnpm install
pnpm dev            # http://localhost:5173
pnpm test           # tests unitaires (Vitest)
pnpm check:pdf      # rend chaque modèle x langue, vérifie le texte, PNG dans out/
pnpm test:e2e       # build, serveur de preview, Playwright (Chromium)
```

Premier lancement e2e : `pnpm exec playwright install chromium`.

## Ajouter un modèle

1. Créer `src/templates/<id>.tsx` qui exporte `Component`, lequel reçoit `{ cv, labels }` (voir `TemplateProps` dans `src/templates/types.ts`) et rend un `<Document>` react-pdf (A4). `classique.tsx` sert d'exemple.
2. Ajouter une entrée (`id`, `name` par langue, `load: () => import('./<id>')`) au registre `src/templates/index.ts`.
3. Lancer `pnpm check:pdf` : toutes les langues, arabe RTL compris, doivent s'afficher.

## Polices

Les polices sont dans `public/fonts`, sous licence SIL Open Font License 1.1 (textes de licence à côté) : Inter (`OFL-Inter.txt`), Lora, renommée « CVLove Serif » comme l'exige son Reserved Font Name (`OFL-Lora.txt`), Tajawal pour l'arabe (`OFL-Tajawal.txt`). Le code est sous MIT.

## Déployer sur Vercel

Importer le dépôt GitHub dans Vercel. Le preset Vite est détecté (build `pnpm build`, sortie `dist`) ; aucune configuration n'est nécessaire.

## Licence

MIT, voir `LICENSE`.
