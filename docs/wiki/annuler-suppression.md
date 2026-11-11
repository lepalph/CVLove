# Annuler une suppression

Fait le 2026-11-02, sur la base `lepalph/CVLove@4dfd4c3` (P0 n° 1 de la [synthèse du panel](panel-synthese.md)).

## Ce qui a été fait
- Après la suppression d'une section, d'une entrée, d'un champ personnel (dont les champs personnalisés) ou de la photo, un bandeau « {x} supprimé(e) · Annuler » s'affiche 8 s. Une nouvelle suppression le remplace : il n'y en a jamais qu'un.
- Le bandeau est fixé en bas de la colonne du formulaire, au-dessus du pied d'éditeur. Il ne couvre ni l'aperçu ni la barre d'actions. Sur mobile, il est masqué dans l'onglet Aperçu. Le conteneur est un `role="status"` toujours présent, donc l'annonce est lue.
- « Annuler » remet le contenu du CV tel qu'il était, à la même place, et rend le focus à l'élément rétabli (titre de la section, premier champ de l'entrée ou du champ, bouton photo).
- Ctrl/Cmd+Z annule quand le focus n'est pas dans un champ de texte (input, textarea, select, contenteditable). Dans un champ, Ctrl+Z reste natif. Pas de rétablir.
- Libellés dans `src/i18n/undo.ts` (fr, en, de, es, it, pt, ar). `prefers-reduced-motion` est géré par la règle globale de `index.css` (l'animation d'entrée `.undo-in` tombe à 0,01 ms).

## Mécanisme
- `useUndo` (`src/store.ts`) est un petit store à part : un seul instantané `{ docId, data, label, rid, n }`. Il n'est pas dans le store persisté, donc l'enregistrement automatique et la synchro entre onglets ne changent pas.
- `deleteWith(label, rid, fn)` garde le `data` du CV actif, puis appelle `update(fn)`.
- `undoDelete()` passe par `restoreSnap` (`src/model/undo.ts`, pur, testé). Il remplace le `data` du document et met `updatedAt` à maintenant, donc la règle « la version la plus récente gagne » de la synchro joue. Il ne fait rien si le document n'existe plus, n'est plus un CV ou n'est plus le document actif.
- Quitter l'éditeur efface l'instantané.

## Limites
- On rétablit tout le contenu du CV, pas seulement l'élément supprimé : ce qui a été saisi entre la suppression et « Annuler » (au plus 8 s, ou plus avec Ctrl+Z) est perdu. Le design, lui, n'est pas touché. *Remplacé le 2026-11-02, voir plus bas.*
- Ctrl+Z juste après un ×, quand le focus est déjà passé sur un champ voisin (`removeThenFocus`), garde son effet natif : il faut cliquer « Annuler » ou sortir du champ.
- Le délai de 8 s ne se met pas en pause au survol ni au focus.
- La lettre n'a rien à supprimer (pas de liste ni de section), donc elle n'est pas concernée. « Tout effacer » (confirmation) et la suppression d'un document (Mes documents, confirmation) ne passent pas par le bandeau.
- Une suppression faite dans un autre onglet n'est pas annulable ici.

## Preuves
- `src/model/undo.test.ts`, `src/i18n/undo.test.ts` ; `tests/e2e/undo.spec.ts` (bureau, mobile 390 px, arabe) ; suite complète `OUT_DIR=.frozen/undo E2E_PORT=4351 pnpm test:e2e` : 188 passés, 1 ignoré.

## 2026-11-02 : Annuler ne rétablit plus que l'élément supprimé
Changement fait sur la base `lepalph/CVLove@eb3cc4b`.
- L'instantané garde toujours le CV d'avant (`Snap = { docId, data, rid }`), mais `restoreSnap` ne le recopie plus en entier. Il prend dans cet instantané l'élément dont l'id est `rid` (section, entrée, champ, ou `'photo'`) et le remet dans le CV tel qu'il est au moment d'annuler, juste après sa voisine précédente encore présente. Le reste, y compris ce qui a été saisi pendant le bandeau, ne bouge pas.
- Rien n'est rétabli dans deux cas : l'élément est déjà là, ou la section d'une entrée supprimée a disparu entre-temps.
- Preuves : `src/model/undo.test.ts` (6 tests, dont la saisie gardée) et le test e2e « Annuler ne rétablit que l'élément » dans `tests/e2e/undo.spec.ts`, en bureau, mobile et arabe.
- Le test Ctrl+Z était instable : il a échoué 1 fois sur 4. La cause : le × rend le focus dans un `requestAnimationFrame`, qui pouvait arriver après le `focus()` du test. Le test attend maintenant deux frames.
- Les autres limites restent : Ctrl+Z natif juste après un ×, et un délai de 8 s qui ne se met pas en pause.


## 2026-11-11 : limites rouvertes (base `21d928e`)
Décisions de l'agent, sans question à l'auteur. Preuves : `tests/e2e/limites-ouvertes.spec.ts` (écrits d'abord, en échec avant le correctif) et `tests/e2e/undo.spec.ts`.
- **Délai suspendu** (`src/ui/UndoBar.tsx`) : tant que le pointeur est sur le bandeau ou que le focus y est, le minuteur de 8 s ne tourne pas (WCAG 2.2.1). À la sortie il repart de zéro (8 s pleines). Un nouveau bandeau remet l'état à « libre ».
- **Ctrl+Z après un ×** : c'était un défaut. Le focus passe sur un champ voisin qui n'a rien reçu, donc Ctrl+Z natif n'y fait rien et l'utilisateur croit que l'annulation n'existe pas. Correction : `UndoBar` note (écouteur `input` en capture, `WeakSet`) les champs où l'on a déjà saisi. Ctrl+Z annule la suppression seulement dans un champ jamais saisi ; dans un champ déjà saisi il reste natif, donc l'annulation native n'est jamais volée. Le test e2e « Ctrl+Z hors champ » de `undo.spec.ts` saisit d'abord dans le champ.
- **Limite restante** : une valeur changée par code (exemple, import) n'est pas une saisie, donc le champ reste « vierge » pour cette règle ; sans conséquence, le natif n'avait rien à défaire non plus.
- Les deux limites « Ctrl+Z natif juste après un ×» et « délai sans pause » ci-dessus ne sont donc plus d'actualité.
