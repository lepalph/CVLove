# Sections : glisser-déposer et repli

Écrit le 2026-11-02. Concerne le formulaire de l'éditeur (mode complet, et mode guidé : mêmes `SectionsCard` et `SectionEditor`).

## Ce qui a été fait

- **Glisser** : poignée à 6 points (bouton 44 px, `cursor: grab`, `touch-action: none`, `aria-label` « Glisser pour déplacer la section X »). Pointer events avec capture du pointeur, donc souris et tactile par le même code ([`src/ui/sectionDrag.ts`](../../src/ui/sectionDrag.ts)). Pendant le glisser : la section suit le pointeur (`transform`, le DOM ne bouge pas), une barre marque la position d'insertion, le panneau défile près des bords (56 px), Échap ou `pointercancel` annule. Au lâcher, une seule mise à jour via `moveSectionTo(cv, id, index)` (`src/model/cv.ts`, testée). Les boutons ↑↓ restent pour le clavier. Résultat annoncé dans une zone `role=status` de `SectionsCard` : « Section X déplacée en position 3 sur 6 ».
- **Replier** : chevron par section (`aria-expanded`, `aria-controls`), résumé d'une ligne quand c'est replié (« 3 expériences · Vendeuse, Caissière… », tronqué en CSS), boutons « Tout replier » / « Tout déplier » (visibles s'il y a au moins 2 sections affichées ; en mode guidé ils n'agissent que sur les sections de l'étape). L'état est le champ optionnel `Section.collapsed?: boolean`, gardé avec le document, relu par `sanitize.ts` (seul `true` survit), ignoré par le PDF.
- Libellés dans `src/i18n/sections.ts` (7 langues) ; le résumé est la fonction `sectionSummary`, testée.

## Pourquoi ces choix

- Pointer events plutôt que DnD HTML5 : ce dernier ne fonctionne pas au toucher et ne permet pas de fantôme ni d'autodéfilement maîtrisés.
- Le contenu replié reste dans le DOM avec l'attribut `hidden` (pas de démontage) : le focus sur le chevron est préservé et l'état local des listes de dates n'est pas perdu.
- `collapsed` est dans le modèle (pas dans l'état UI) pour suivre le document. `false` n'est pas stocké (`undefined`), donc un CV jamais replié garde le même JSON qu'avant.
- Le `<details>` de `DesignCard` (réglages du design) n'a rien à voir avec les sections : laissé tel quel, pas de doublon.
- Zone live propre à `SectionsCard` : la zone de l'éditeur (`said`) est un état local de `Editor` ; la faire descendre aurait demandé une prop à travers le mode guidé et le mode complet.

## Limites

- Pluriel des résumés : singulier si 1, pluriel sinon. L'arabe a un duel (2) et des règles propres (3 à 10, 11+) qui ne sont pas rendues finement.
- Le glisser ne se fait qu'entre sections affichées ensemble : en mode guidé, uniquement dans l'étape en cours (ex. Compétences et Langues).
- Une section très haute (dépliée) glisse en entier : replier d'abord rend le geste plus facile. La position d'insertion se décide au milieu des autres sections.
- Sur 390 px, la ligne de boutons passe sur deux lignes (poignée, chevron et titre, puis Masquer et ×).
- La poignée ne se commande pas au clavier : ↑↓ jouent ce rôle.
- Tests : `tests/e2e/sections.spec.ts` (souris, toucher via CDP, Échap, clavier, repli, rechargement, arabe, autodéfilement, 390 px).

## Revue du chief of staff (2026-11-02, `lepalph/CVLove@936ba5b`)
- `collapsed` vit dans les données du CV : replier une section relance le rendu PDF (identique) et met à jour la date du document. Acceptable pour l'instant ; à sortir dans un état d'interface par document si la [performance](../REPRISE.md) de l'aperçu devient le sujet.

## Ordre des sections dans le PDF (2026-11-02, base `lepalph/CVLove@6a8e660`)
- Le 2026-11-02, l'utilisateur a signalé que « le déplacement doit suivre dans le PDF aussi ».
- Cause : quatre modèles ne suivaient pas l'ordre de l'éditeur.
  - `colonne-pleine`, `lateral-droit` et `moderne` plaçaient toujours « Centres d'intérêt » en fin de colonne latérale.
  - `grille` rangeait sa grille dans un ordre fixe : formation, compétences, langues, intérêts.
- Correction : ces quatre modèles prennent maintenant les sections dans l'ordre de l'éditeur, à l'intérieur de chaque groupe.
- Contrôle : une règle « ordre » dans `scripts/check-pdf-ats.ts`, lancée par `pnpm check:pdf`. Elle met les intérêts en tête et vérifie qu'ils sortent avant les compétences, sur les 36 modèles. Sans le correctif, elle échoue sur 12 modèles.
- Limite connue : dans un modèle à deux colonnes, une section ne change pas de colonne.
  - Expérience, formation, projets et sections libres vont dans la colonne principale. Compétences, langues et intérêts vont dans la colonne latérale.
  - Glisser « Compétences » au-dessus d'« Expérience » ne change donc rien dans ces modèles. L'ordre est respecté à l'intérieur de chaque colonne.
  - Même chose pour `compact` et `grille`, qui ont une partie en flux et une partie en grille.
