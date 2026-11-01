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
