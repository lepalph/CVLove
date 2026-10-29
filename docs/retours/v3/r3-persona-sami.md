# Retour v3, ronde 3 : Sami, contributeur front-end

## Qui

Sami, 29 ans, développeur front-end. Il tombe sur le dépôt sur GitHub. Il veut contribuer un modèle de CV, pas utiliser l'outil. Il lit tout avant de coder. Mac 8 Go, Node 24, pnpm.

## Parcours

1. Lecture de README, CONTRIBUTING, modèle de PR, modèle d'issue `new_template.yml`, `ci.yml`, `types.ts`.
2. Clone, `pnpm install` (instantané, cache pnpm).
3. Idée de départ : « bandeau-gauche ». En lisant `moderne.tsx`, je vois que le style 1 de Moderne s'appelle déjà « Bandeau » et met un bandeau à gauche. Je change d'idée : une mise en page « Ruban », une colonne, en-tête pleine largeur coloré, 3 styles (`solid`, `tint`, `edge`).
4. Copie de `classique.tsx` vers `ruban.tsx`, édition de `meta`, ruban en marges négatives. Aucun fichier d'enregistrement à toucher : `import.meta.glob` fait le travail.
5. `pnpm build` : OK. `pnpm test` : 113 tests OK. `pnpm check:pdf` : 535/535 rendus valides, ATS OK, 1 min 32. `pnpm test:e2e` : 43/43 OK en 43 s (Chromium déjà installé ici).
6. Lecture des PNG : `ruban-1-fr`, `ruban-2-ar` (RTL), `long-ruban-2-en-p2`. Le rendu est propre, la page 2 n'a pas de ruban parasite, le titre n'est jamais seul en bas de page.
7. Checklist de PR cochée mentalement (voir plus bas).

## Première impression du dépôt

Très bonne. Le README tient en un écran utile, la promesse « une mise en page = un fichier » est vraie, et je l'ai vérifiée : aucun fichier d'index à modifier, le catalogue e2e a accepté mon 13e layout sans changement. `types.ts` est un vrai guide, dense mais complet. Les modèles d'issue et de PR existent, ce qui rassure.

Ce qui m'a ralenti : tout est écrit pour quelqu'un qui connaît déjà react-pdf et le projet. Je n'ai aucune vue des 12 mises en page existantes avant de lire leur code.

## Frictions

### P0

Aucune. J'ai pu livrer un modèle qui passe tous les contrôles sans demander d'aide.

### P1

- **CONTRIBUTING.md, section « Add a CV layout » : rien ne montre les mises en page existantes.** J'ai failli recréer Moderne « Bandeau ». Correction : ajouter un tableau « Existing layouts » (id, colonnes, 3 noms de style, une phrase) ou un lien vers `docs/images/templates.png`, et la phrase « Check the catalog (`pnpm dev`, home) before proposing a layout: no duplicates ».
- **CONTRIBUTING.md et README : le filtre `ONLY=<regex>` de `scripts/check-pdf.ts` (ligne 202) n'est documenté nulle part.** Sans lui, chaque essai coûte 1 min 32 pour 535 rendus, dont 520 qui ne concernent pas mon modèle. Je l'ai trouvé en lisant le script. Correction : dans le tableau des scripts, ligne `check:pdf`, ajouter « `ONLY=ruban pnpm check:pdf` renders only the jobs whose name matches ».
- **CONTRIBUTING.md étape 2 : `category` n'est pas expliquée.** `types.ts` donne la liste fermée (`classique, moderne, creatif, simple`) mais pas ce qu'elle change (elle alimente le filtre « Catégorie » de `DesignPanel.tsx`). J'ai deviné `moderne`. Correction : une ligne « category: filter in the gallery, pick the closest, closed list in `types.ts` ».
- **CONTRIBUTING.md étape 3 : l'en-tête pleine largeur n'est pas couvert.** `t.pageStyle(padV, padH)` ajoute toujours le padding de page. Pour un ruban pleine largeur, j'ai dû utiliser des marges négatives (`-t.m(40)`, `-t.m(44)`) en devinant qu'elles suivraient le réglage de marges. Moderne fait autrement (padding à 0, fond `fixed` absolu). Correction : un court paragraphe « Full-bleed backgrounds » dans `types.ts` avec les deux recettes et leurs limites (négatif = page 1 seulement, `fixed absolute` = toutes les pages).
- **PR template et CONTRIBUTING : la case « Accent contrast is enough, also with custom colors » n'est pas vérifiable automatiquement pour un layout.** `lotb.test.ts` teste `ink()` et `onAccent()` seuls, pas les mises en page. `check:pdf` rend avec `#facc15` (ligne 183) mais ne mesure aucun contraste. Un contributeur peut utiliser `t.accent` brut en texte, tout passe, et la case reste cochée à tort. Correction : soit un test qui rend chaque layout avec `#ffffff` et `#000000` et échoue si un texte est illisible, soit écrire dans la case « (visual check: `ONLY=<id> pnpm check:pdf` then open `out/max-<id>-*.png`; use `ink()` for every colored text) ».
- **README.md et README.fr.md lignes 13 et 39 : « 36 templates / 12 layouts » en dur.** Mon 13e layout les rend faux (39). Le même chiffre est dans `lotb.test.ts` (commentaire « 12 mises en page »). Correction : ajouter à la PR checklist « update the counts in README.md / README.fr.md », ou mieux, retirer le nombre exact (« more than 30 templates »). Les captures `docs/images/templates.png` seront aussi à refaire : le dire.

### P2

- **CONTRIBUTING.md étape 4 : la liste des helpers est incomplète.** `classique.tsx` utilise `colon`, `entryMeta`, `fixBidi`, `contactList`, absents de la liste de CONTRIBUTING (présents dans `types.ts`, sauf `colon`). Correction : lister `colon` dans `types.ts`, et renvoyer vers lui depuis CONTRIBUTING.
- **CONTRIBUTING.md étape 2 : `order`.** Aucun conseil. J'ai mis 13 (suite). Dire « next free number; the gallery is sorted by it ».
- **README « Add a template » vs CONTRIBUTING : deux versions des mêmes étapes**, légèrement différentes (le README ne dit pas « exactly 3 styles with `variant` + `preset` », ni le format strict de `meta`). Un lecteur pressé s'arrête au README. Correction : le README garde une phrase et renvoie vers CONTRIBUTING.
- **Critère « Renders correctly on A4 in the 7 languages » : `check:pdf` ne produit que `fr` et `ar` en `out/<id>-<n>-<lang>.png`** sur mon modèle (les autres langues sont validées par texte, pas par image). Dire quelles images regarder : `<id>-1-fr`, `<id>-*-ar`, `long-<id>-*-en-p2`, `max-<id>-*-en`.
- **Le critère « No new dependency » est clair, mais « `pnpm test:e2e` pass » demande `playwright install chromium` et ~1,5 Go de disque.** Un mot sur le coût aiderait un contributeur sur petite machine. Ici : 43 s, aucun souci.
- **`ci.yml`** : pas de lint ni de format. Pas un défaut, mais CONTRIBUTING ne dit pas qu'il n'y a pas de linter. Une ligne « No linter: follow the style of the file you copy ».
- **`new_template.yml`** : demande une description et une esquisse, mais pas la catégorie ni le nom des 3 styles. Ajouter un champ « Names of the 3 styles ».

## Vérifiabilité de la checklist de PR

| Case | Vérifiable ? |
| --- | --- |
| build, test, check:pdf, test:e2e passent | Oui, CI. |
| Aucun appel réseau | Oui, e2e (compteur de requêtes). |
| Pas de nouvelle dépendance | Oui, diff de `package.json`. |
| A4, 7 langues, arabe RTL | Moitié : texte vérifié, mise en page à l'oeil sur 2 PNG. |
| Pagination propre sur 2 pages | Moitié : le script rend des CV longs, mais « pas de titre seul en bas » se juge à l'oeil. |
| Texte extractible | Oui. |
| Contraste d'accent | Non, voir P1. |
| Polices et images locales | Oui par la CSP et l'e2e. |
| Captures jointes | Oui, mais l'auteur doit savoir lesquelles (P2). |

## Ce qui m'a plu

- Un layout = un fichier. Aucune ligne de registre, et c'est vrai.
- `types.ts` documente le contrat avec des raisons (pourquoi pas de `letterSpacing`, pourquoi `minPresenceAhead`).
- `check:pdf` rend 535 PDF, vérifie le texte extrait et l'ATS. Un modèle cassé ne passe pas.
- L'arabe est traité sérieusement, pas en option.
- Les fichiers existants sont courts et lisibles : copier `classique.tsx` marche.
- La CI fait exactement ce que CONTRIBUTING demande de lancer en local.

## Temps passé pour un premier modèle

Pour moi, hors temps d'attente des commandes : environ 3 minutes de travail d'agent. Pour un vrai Sami : 1 h à 1 h 30 (lecture 25 min, choix du layout et de l'idée 10 min, code 30 min, `check:pdf` deux ou trois fois à 1 min 30 chacune, e2e, PNG). Avec `ONLY` documenté et un tableau des layouts existants, 45 min.

## Note

8/10. Le dépôt tient sa promesse de contribution simple. Il perd deux points sur ce qui se devine : les modèles déjà là, le filtre `ONLY`, les fonds pleine page, et le contraste jamais vraiment testé par layout.

Fichier de test local : `ruban.tsx` (clone supprimé, aucune modification dans `~/code/cvlove`).
