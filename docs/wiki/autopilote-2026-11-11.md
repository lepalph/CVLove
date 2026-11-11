# Autopilote de la nuit du 11 novembre 2026

Lancé le 2026-11-11 par l'auteur : « fais évoluer la solution vers les objectifs définis ensemble », sans se bloquer. Base : `lepalph/CVLove@21d928e`. Règles : [Règles des agents](regles-agents.md), section du 11 novembre. Inventaire de départ dressé par un agent Haiku à partir de [REPRISE](../REPRISE.md), [SPEC](../../SPEC.md) et des pages du wiki.

## Vague 1 (agents Sonnet, un worktree chacun)
| Agent | Port | Sujet | Page |
|---|---|---|---|
| stockage | 4401 | Exemple listé comme vrai CV, `storage.persist()`, Mes documents (tri, état vide, libellés) | [stockage-documents](stockage-documents.md) |
| lettre | 4402 | Langue d'une lettre vide, alerte non retraduite, accessibilité mineure | [lettre-accessibilite](lettre-accessibilite.md) |
| panel | 4403 | P1 du panel : repli pendant le glisser, guidé allégé, sommaire collant | [panel-p1](panel-p1.md) |
| undo | 4404 | Pause du bandeau Annuler, Ctrl+Z après ×, brouillon de date, repli sans date de modification | [annuler-suppression](annuler-suppression.md) |

## Vague 2 (prévue)
- Panneau Design : filtres du catalogue trop hauts, double séparateur, captures en dark mode et à 768 px (audit UX, P1).
- Performance : rendu de l'aperçu hors du fil principal (Web Worker). C'est une tâche complète, confiée à Opus.
- Niveaux CECRL pour les langues, `dir="auto"` sur les saisies, avertissement quand le modèle n'affiche pas la photo.
- Page « Mentions et confidentialité » (LCEN). L'identité de l'éditeur reste `[À REMPLACER]` : elle revient à l'auteur.

## Écarté pour cette nuit
- Serveur MCP : son architecture est à décider avec l'auteur (REPRISE).
- Nouvelles sections (certifications, bénévolat, publications) : elles touchent les 12 mises en page et le modèle de données, on les garde pour une passe à part.
- Fusion dans `main` et déploiement : ils reviennent à l'auteur.
