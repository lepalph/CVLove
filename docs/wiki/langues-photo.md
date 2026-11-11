# Langues (CECRL), `dir="auto"` et photo

Date : 2026-11-11, base `33ddefc` (lot 2 de [REPRISE.md](../REPRISE.md)). Décisions prises sans question (voir [Règles des agents](regles-agents.md)).

## Niveaux CECRL
- Nouveau champ `Item.cefr` (`A1` à `C2`, `native`), réservé à la section Langues. `level` (1 à 5) reste pour les compétences.
- Migration dans `sanitize.ts` (`cleanLanguage`), donc au chargement du localStorage et à l'import JSON : un `cefr` valide est gardé, sinon l'ancien `level` devient 1→A1, 2→A2, 3→B1, 4→C1, 5→C2, puis `level` est supprimé des langues. Le 5 ne devient pas « langue maternelle » : l'ancienne échelle ne permettait pas de le savoir. Idempotent. Test : `src/model/langues.test.ts`.
- Noms dans les 7 langues : `src/i18n/cefr.ts`. Le PDF écrit « B2 · Intermédiaire supérieur » (la langue maternelle sans code) ; les barres et points ont 7 crans pour les langues, 5 pour les compétences (`SkillLevel`, `src/templates/shared.tsx`, commun aux 36 modèles : aucun layout modifié).
- Le texte libre de la langue (« Courant (C1) ») est conservé tel quel : il peut désormais doubler le niveau imprimé, c'est au rédacteur de l'effacer.
- `check:pdf` : en affichage « texte », les noms de niveaux des langues doivent être présents dans le PDF.
- Les exemples (`sample.ts`, `sampleProfiles.ts`) utilisent `cefr`. Libellé « Niveau sur 5 » (`levelOf5`) supprimé.

## `dir="auto"`
Tous les `input` et `textarea` du formulaire CV (`Form.tsx`) et de la lettre (`LetterEditor.tsx`), y compris e-mail et téléphone (sans effet sur du latin). Les champs de date restent `dir="ltr"`.

## Photo
Si `getTemplate(design.templateId).photo` est faux, une ligne sous le bouton photo (`photoHidden`, `cefr.ts`) invite à choisir un modèle avec photo dans Design. Texte seul, sans bouton : la fiche Design est juste en dessous.

## Non vérifié
Rendu visuel des 7 crans dans les 36 modèles (seulement extraction de texte par `check:pdf`) ; arabe en saisie réelle.

## Reprise par le chief of staff (2026-11-11)
- Sur les captures, le niveau sortait deux fois dans les exemples : « Courant (C1) » puis « C1 · Avancé », et « Langue maternelle » deux fois.
- Le texte libre des langues est donc vidé dans les exemples (`sample.ts`, `sampleProfiles.ts`), puisque le niveau CECRL s'imprime seul. Un CV de l'utilisateur garde son texte.
- Les textes de langue encore présents dans les tuples de `sampleProfiles.ts` ne servent plus. On les a laissés pour ne pas toucher ces données.
