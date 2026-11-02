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
- On rétablit tout le contenu du CV, pas seulement l'élément supprimé : ce qui a été saisi entre la suppression et « Annuler » (au plus 8 s, ou plus avec Ctrl+Z) est perdu. Le design, lui, n'est pas touché.
- Ctrl+Z juste après un ×, quand le focus est déjà passé sur un champ voisin (`removeThenFocus`), garde son effet natif : il faut cliquer « Annuler » ou sortir du champ.
- Le délai de 8 s ne se met pas en pause au survol ni au focus.
- La lettre n'a rien à supprimer (pas de liste ni de section), donc elle n'est pas concernée. « Tout effacer » (confirmation) et la suppression d'un document (Mes documents, confirmation) ne passent pas par le bandeau.
- Une suppression faite dans un autre onglet n'est pas annulable ici.

## Preuves
- `src/model/undo.test.ts`, `src/i18n/undo.test.ts` ; `tests/e2e/undo.spec.ts` (bureau, mobile 390 px, arabe) ; suite complète `OUT_DIR=.frozen/undo E2E_PORT=4351 pnpm test:e2e` : 188 passés, 1 ignoré.
