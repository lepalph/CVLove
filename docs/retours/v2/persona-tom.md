# Retour persona : Tom (dev anglophone, contributeur open source)

**Qui** : Tom, 34 ans, développeur, contributeur open source, desktop 1440x900, navigateur et UI en anglais. Il veut un CV en anglais, au format Letter, et regarder si le projet est contribuable.
**Scripts** : `.personas/tom/` ; captures : `docs/retours/v2/captures/tom/`.

## Parcours réalisé
Accueil EN > Create my CV > mode guidé (9 étapes) > bascule Full > prénom, nom, titre > Letter > Download PDF (`CV-Tom-Hartley.pdf`, 2 pages) > My documents : Export, Duplicate, Rename, New résumé, Delete (confirm natif), Import du JSON, import d'un faux JSON (message clair) > clone dans /tmp/cvlove-tom, install, ajout d'une 13e mise en page, `check:pdf`, `pnpm test`, `tsc`. Aucune requête hors localhost, aucune erreur console.

## Frictions
**P0** : aucune.
**P1**
- Données d'exemple d'une autre personne (Camille, e-mail, tél., site) : je change le nom, le reste reste dans le PDF (`camille.marchand@example.com`). « Clear everything » est tout en bas du mode Full, introuvable depuis le guidé. Capture 04. Suggestion : bandeau « Exemple : Camille Marchand » avec bouton « Start empty » dès l'étape 1.
- « New résumé » (07) : aperçu vide, alors que les vignettes montrent Camille. Je ne sais pas si ça a planté. Suggestion : état vide explicite (« Fill in step 2 ») ou vignettes avec un nom neutre.
- Rendu : titre « Interests » orphelin en bas de page 1, son contenu en page 2 (10, Letter). `minPresenceAhead` n'agit pas ici. Suggestion : regrouper titre + premier item dans un `View wrap={false}`.
- Les documents s'appellent « CV », « CV 2 », « CV 3 » au lieu de « Tom Hartley » ; réimporter le même export crée un 2e « CV » sans avertissement ni message (06). Suggestion : nom par défaut = nom complet ; message « 1 document imported ».
**P2**
- Noms de styles en français dans l'UI anglaise (« Classic · Académique », « Timeline · Frise »). Dire s'ils sont voulus (README) ou traduire.
- « Résumé » : on dit « resume » en US ; « Letter » n'est pas proposé d'office quand `navigator.language` = en-US.
- Les pastilles d'étapes 1 à 9 sont des chiffres seuls (le nom n'est que dans le menu « Steps ») ; en-tête du mode Full : Design avant Personal details, étrange.
- Suppression via `confirm()` natif, rename qui valide au blur : correct mais pas dans la DA.
- Pas de lien GitHub dans l'éditeur ni dans le footer des Documents.

## Avis DA
Sobre, lisible, vrai look Vercel : noir/blanc, Geist, filets fins, contrastes forts, cibles larges, cœur rouge discret. Rassurant (« Everything stays on your device »). Pour un dev c'est le bon ton ; pas de dark mode visible (SPEC « hors v1 » puis ajouté ?). La grille de 36 vignettes réelles est impressionnante mais longue : un filtre mémorisé aiderait.

## Conformité du rendu
Letter respecté : PDF 612x792 pt, canvas d'aperçu 736x952 (ratio 1,294), A4 gardé pour les vignettes. Comparaison pixel aperçu (canvas) vs page 1 du PDF (pdfjs + napi-canvas) : mêmes dimensions, 4,2 % de pixels différents (> 30/765), 0,9 % très différents, soit l'anti-crénelage ; visuellement identique (05b vs 10). Texte extractible (ATS). Nom de fichier correct. JSON exporté valide (`version: 2`, design inclus, 8 Ko).

## Expérience contributeur
- Ajouter une mise en page : un fichier `layouts/tabloid.tsx` copié de `minimal.tsx`, 3 styles, **aucun registre à toucher** : `check:pdf` 534/534 rendus OK en 28 s, PNG dans `out/` (11), `pnpm test` 35/35, `tsc` propre. Vraiment bien fait.
- Manque : **README périmé** (dit `src/templates/<id>.tsx`, `{cv, labels}` et registre `index.ts` ; la réalité v2 est `layouts/`, `import.meta.glob`, `design`, 3 styles) ; le vrai contrat est en tête de `types.ts`, **en français**, bloc dense ; pas de CONTRIBUTING.md, ni `.github` (templates d'issue/PR, CI), ni CODE_OF_CONDUCT ; pas de script `lint`/`format` ; test e2e en français ; pnpm signale « Ignored build scripts: esbuild » (`pnpm approve-builds` à documenter) ; pas de `pnpm scaffold:layout <id>` ; pas de test qui vérifie l'unicité de `order`, ni les noms de style ; critères d'acceptation d'un modèle absents (licence, pas de copie, lisible ATS) ; pas de capture « avant/après » exigée en PR ; docs/ vide pour un nouveau venu.

## Ce qui m'a plu
Tout local, vérifié par un test e2e ; export/import JSON ; aucun compte ; rendu fidèle ; fichiers PDF propres ; registre automatique.

## Note : 7,5/10

## 3 recommandations
1. Corriger le README (EN) pour la v2 et ajouter CONTRIBUTING.md (EN) avec le pas-à-pas de la mise en page, les critères d'acceptation et la PR checklist ; traduire l'en-tête de `types.ts`.
2. Effacer ou signaler les données d'exemple (bandeau « Start empty » dans le guidé, état vide du nouveau CV) et nommer les documents d'après la personne.
3. Corriger le titre orphelin (« Interests ») et ajouter `pnpm new:layout`, une CI GitHub (test + check:pdf + tsc) et des templates d'issue/PR.
