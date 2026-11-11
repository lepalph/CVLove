# Stockage et liste des documents

Daté du 2026-11-11, base `21d928e`. Source : [REPRISE.md](../REPRISE.md), « court terme » et « lot 2 ». Règles : [Règles des agents](regles-agents.md).

- **Exemple chargé.** Toujours vrai à la base : `loadSample` écrit l'exemple dans le CV actif, qui prend le nom de la personne fictive et devient un document enregistré, listé comme un vrai CV. Décision : on le garde enregistré (la personne peut l'éditer), mais Mes documents le marque « Exemple » (7 langues, `src/i18n/documentsList.ts`) tant que son nom est celui d'un profil d'exemple (`isExampleCV`). Renommer le CV ou changer le nom retire la pastille.
- **Stockage durable.** `navigator.storage.persist()` est demandé une seule fois par session de page, au premier enregistrement réussi qui contient un vrai document (`askPersist` dans `flushSave`, `src/store.ts`). Refus, rejet ou API absente : ignorés, rien ne bloque. Pas de message : sous Firefox le navigateur affiche déjà sa propre demande.
- **Tri.** Mes documents trie par `updatedAt` décroissant (`byRecent`, `src/ui/docList.ts`) ; le tableau du store n'est pas modifié.
- **État vide.** Une phrase qui dit de cliquer « Nouveau CV » ou d'importer un JSON, au lieu d'une liste vide.
- **Libellés.** Les noms automatiques « CV », « CV 2 », « Lettre » sont traduits à l'affichage (`shownName`) avec `kindCV` / `kindLetter` de `v2.ts` ; le nom stocké reste inchangé (pas de migration). Un nom choisi reste tel quel.
- Tests : `src/ui/docList.test.ts` (tri, noms), `tests/e2e/stockage.spec.ts` (état vide, pastille, une seule demande de persistance, tri, lettre traduite).
