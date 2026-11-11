# Lettre et accessibilité

2026-11-11, base `21d928e` (court terme de [REPRISE.md](../REPRISE.md)). Specs : `tests/e2e/lettre-a11y.spec.ts`, `src/model/letterBlank.test.ts`.

| Point | État à `21d928e` (preuve) | Décision |
|---|---|---|
| Lettre vide et langue de l'interface | Défaut. Le CV vierge suit `uiLang` (`alignBlank`, `src/store.ts`), pas la lettre : en passant en anglais, la formule restait « Madame, Monsieur, » (spec rouge). | `isBlankLetter` / `alignBlankLetter` (`src/model/letter.ts`) ; `LetterEditor` les applique quand `uiLang` change (et à l'ouverture). Vierge = rien de saisi et formules encore celles de sa langue ; une lettre commencée garde la sienne. Le choix manuel de « Langue de la lettre » n'est pas écrasé (l'effet ne dépend que de `uiLang`). |
| Alerte « document vide » | Défaut. `useDownloadAlert` mémorisait le texte déjà traduit. | `fail('empty' \| 'pdf')` : le texte est choisi au rendu, donc retraduit (CV et lettre). Aucun libellé nouveau. L'alerte survit à l'alignement de langue d'une lettre vierge. |
| Échec du PDF annoncé deux fois | Défaut. Le téléchargement et l'aperçu posaient chacun un `role="alert"` avec le même texte (spec : 2 alertes). | `PreviewPane` reçoit `quiet` : tant que l'alerte du téléchargement est là, le message de l'aperçu reste visible mais n'est plus une alerte. |
| « Exemple » pour les lecteurs d'écran | Défaut. L'étiquette « Exemple… » était `aria-hidden`. | Elle est ajoutée au nom (`aria-label`) de l'aperçu quand le document est vide. Pas de nouveau texte : `samplePreview` existe en 7 langues. |
| Allemand à 401 px | Déjà réglé : à 401 px en allemand, aucun élément de `header.edbar` ne dépasse et `scrollWidth` = 401 (CV, lettre, modes complet et guidé, 360/390 aussi). | Spec de non-régression ajoutée (verte dès le départ). |
| Régions live en double | Non reproduit comme annonce doublée : l'éditeur CV a deux zones `role=status` vides (sections dans `Form.tsx`, aperçu dans `PreviewPane`) aux rôles distincts, plus l'`UndoBar` et le compteur du pied. Aucun message n'est annoncé par deux zones, hors l'échec du PDF (corrigé). | Rien changé. Les fusionner demanderait de toucher `Form.tsx` (interdit ici). |

## Notes pour les autres agents
- `src/store.ts` : le plus propre serait d'appeler `alignBlankLetter` dans `setUiLang`/`alignBlank` (comme pour le CV), pour que les lettres vierges non ouvertes suivent aussi. Pas fait (fichier réservé) ; l'effet de `LetterEditor` couvre la lettre ouverte.
- Non vérifié : lecteur d'écran réel (NVDA, VoiceOver) ; les annonces sont déduites du DOM.
