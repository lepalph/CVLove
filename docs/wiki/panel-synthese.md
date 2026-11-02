# Synthèse du panel d'inventeurs

Le 2026-11-02, le chief of staff a fait cette synthèse à partir des pages [TRIZ](panel-triz.md), [Edison](panel-edison.md), [Engelbart](panel-engelbart.md) et [Rams](panel-rams.md), rondes 1 et 2. Le panel a testé `lepalph/CVLove@8b5a988`. Brief : [panel-brief.md](panel-brief.md).

## Ce sur quoi le panel s'accorde
- **Annuler une suppression.** C'est la seule idée que les quatre placent dans leur top 3. Le « × » efface une section ou une entrée sans confirmation ni retour, et le « × » suivant arrive sous la souris (TRIZ, capture 3). Rams s'y rallie parce que l'annulation rend inutiles les confirmations et les phrases d'aide.
- **La date en une seule saisie** est dans le top 3 de TRIZ, d'Engelbart et d'Edison. Sur 84 clics pour remplir un CV, 48 servent aux listes Mois et Année (Edison).
- **Relier l'aperçu au formulaire** est dans le top 3 de TRIZ, d'Engelbart et de Rams : cliquer une ligne de l'aperçu ouvre son champ, et le champ actif fait défiler l'aperçu. C'est faisable avec le texte que pdf.js extrait, puisque 36 morceaux de texte sur 57 retrouvent leur champ directement (Engelbart).
- **Deux corrections S mesurées par Edison :**
  - la note « PDF enregistré » recouvre le menu Fichier, et l'export JSON attend alors 6,25 s ;
  - replier une section relance un rendu PDF identique, alors que la [revue des sections](sections-glisser-replier.md) l'avait déjà signalé.

## Désaccords tranchés
- **Retirer la poignée sur téléphone (Rams 3) : écarté.** Edison a mesuré qu'au doigt, glisser déplace une section en un seul geste de 0,2 s, contre un tap par place avec ↑. Le vrai problème est la hauteur des sections dépliées, ce qui renvoie à Edison 5 (P1).
- **« Masquer » seul au lieu de « × » (Rams 2) : écarté.** Une section masquée reste dans le JSON exporté, donc la personne croit avoir effacé une donnée qu'elle peut encore partager sans le savoir (Engelbart). Avec l'annulation, le « × » devient sûr.
- **Tiroir d'aperçu et réglages dans l'onglet Aperçu sur mobile (TRIZ 1, Edison 3) : P2.** Rams compte 8 contrôles sur l'écran mobile le plus propre, et l'idée en ajouterait autant. De plus, un rendu bloque l'écran 0,8 à 1 s sur un téléphone lent.

## Priorités décidées le 2026-11-02
**P0, à faire cette nuit :**
1. Annuler une suppression : bandeau « … supprimé · Annuler » pendant 8 s, annoncé aux lecteurs d'écran, et Ctrl/Cmd+Z hors des champs de texte (dans un champ, Ctrl+Z garde son effet natif). Ça couvre les sections, les entrées, les champs et les contacts.
2. La date en une saisie : un seul champ « MM/AAAA » qui accepte 03/2021, 3/21, 2021 ou « mars 2021 » dans les 7 langues. La valeur est normalisée en sortie de champ, avec une erreur en clair. Le stockage en `AAAA-MM` ou `AAAA` ne change pas.
   - Cette décision revient sur le choix de la ronde 2 v3 (`DatePick`, des listes pour avoir un format constant). Le format constant est gardé grâce à la normalisation.
3. Les petites corrections S :
   - la note PDF ne recouvre plus le menu Fichier ;
   - `collapsed` sort des dépendances du rendu ;
   - un témoin discret « Enregistré sur cet appareil » apparaît après chaque sauvegarde (TRIZ 5 et le court terme de [REPRISE.md](../REPRISE.md)).

**P1, ensuite :**
- l'aperçu relié au formulaire, dans les deux sens (M), à vérifier sur les modèles en deux colonnes ;
- les sections repliées automatiquement pendant le glisser (Edison 5) ;
- le mode guidé allégé, sans barre d'outils par section (Rams 1) ;
- un sommaire collant en mode complet (TRIZ 4, sans accordéon exclusif).

**P2 :**
- la palette Ctrl+K (Engelbart 4) ;
- « Tenir sur 1 page » (Engelbart 5) : Edison a mesuré qu'il faut à la fois des marges serrées et un texte réduit à 0,9 ;
- l'étape Modèle limitée à 6 modèles, avec « Voir les 36 » (Rams 4) ;
- la fusion de l'étape Télécharger (Rams 5) ;
- les réglages dans l'onglet Aperçu sur mobile.

**Écarté :** retirer la poignée sur mobile, « Masquer » seul et l'accordéon exclusif.

## Ce que le panel n'a pas vérifié
L'arabe en profondeur, le mode guidé de bout en bout, un vrai téléphone (le tactile était émulé) et le temps réel d'une personne pour remplir un CV (estimé à environ 13 minutes).
