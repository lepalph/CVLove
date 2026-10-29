# Ronde 3 : Gérard (iPad)

## Qui
Gérard, 61 ans, ancien conducteur de bus, cherche un poste d'agent d'accueil à temps partiel. iPad simulé : 820×1180 en portrait, puis 1180×820 en paysage, tactile, fr-FR. Il lit mal les petits caractères, se méfie d'Internet, ne connaît pas PDF, JSON, modèle. Test sur http://localhost:4303, contexte neuf. Il avait testé la ronde 2 (`r2-persona-gerard.md`) : chaque friction est rejugée plus bas.

## Parcours réalisé
Accueil, "Créer mon CV", éditeur guidé : Identité (photo PNG de test), Profil, 3 expériences avec les listes Mois / Année, Formation passée, Compétences ("Savoir-être"), Autres sections (section libre "Permis" / "Permis D (transport en commun)"), Design passé, Télécharger. Aperçu, téléchargement réel (`CV-Gerard-Dubreuil.pdf`, vérifié en image). Puis contexte fermé, nouveau contexte avec le même storageState, accueil, "Mes documents", réouverture, passage en paysage. Aucune erreur, aucun blocage.

## Première impression (les 30 premières secondes)
Captures 01 et 07. Le titre est toujours gros et clair : "Votre CV en PDF, sans compte et sans frais." L'en-tête tient dans l'écran, le bouton "Créer mon CV" n'est plus coupé. Sous le titre, la ligne grise "Gratuit et open source · 7 langues · Sans inscription" est encore en petite police à chasse fixe ; je la saute. Le CV d'exemple est maintenant celui de Nadia Perrin, conseillère de vente : accueil des clients, caisse. Ça me parle plus qu'une développeuse, je me vois dedans. Rien de froid, mais la phrase de confidentialité reste en petit dans le texte d'intro ("Tout se passe sur votre appareil").

## Verdict sur les frictions de la ronde 2

| Friction (r2) | État | Constat ronde 3 |
|---|---|---|
| P1-1 Accueil : débordement horizontal | **Corrigée** | Largeur de page mesurée : 820 px sur 820 px, bouton visible (capture 01). |
| P1-2 Retrouver son CV | **Corrigée** (reste un détail) | Au retour, une carte en haut de l'accueil : "Reprendre mon CV, Gérard Dubreuil, modifié le 29/10/2026 09:20. Il est enregistré dans ce navigateur, sur cet appareil." + bouton "Reprendre" (capture 07). Le bouton "Créer mon CV" de l'en-tête est resté le même, mais la carte est au-dessus de tout. Détail : "Reprendre" ouvre l'éditeur à l'étape 1 "Modèle" (voir P1-3 ci-dessous). |
| P1-3 Vocabulaire JSON au téléchargement | **Améliorée** | Étape 9 : il reste un seul "Exporter (JSON)" ; "Importer" et "Tout exporter" ont disparu ; "Tout effacer" est séparé par un trait, plus loin des autres (capture 05). Mais "JSON" est toujours là, et la page "Mes documents" garde "Importer (JSON)" et "Tout exporter (JSON)" (non gardé en capture). |
| P1-4 Réassurance données discrète | **Toujours là, un peu mieux** | Le pied de page est inchangé : "0 requête vers un autre site", police à chasse fixe, petite. La phrase claire "Tout reste sur votre appareil : rien n'est envoyé sur Internet" est toujours seulement à l'étape 9, en 14 px. La carte "Il est enregistré dans ce navigateur, sur cet appareil" aide à comprendre où sont les données. |
| P1-5 Petits textes 12-14 px | **Toujours là** | Mesuré : onglets d'étapes 12 px en Geist Mono, aides ("Le PDF est fabriqué…", "Une ligne par point…") 14 px, étiquette "ÉTAPE 9 SUR 9" en mono. Les champs restent en 16 px et hauts. |
| P1-6 Dates en anglais | **Corrigée** | Deux listes Mois / Année, en français (capture 03). Limite : mois abrégés "janv.", "févr.", "sept.", "déc." : lisibles, mais pas "mars" ni "septembre" complets. |
| P2-1 Exemples gris qui ressemblent à du vrai texte | **Toujours là** | "Nadia", "Perrin", "Vendeuse", "Lyon, France" en gris dans les champs (capture 02). |
| P2-2 "Masquer" et "×" à côté de chaque champ | **Toujours là** | Présents sur chaque ligne de l'identité (capture 02). |
| P2-3 Permis D pas évident | **Toujours là** | Pas de bouton "+ Permis". L'aide de l'étape 7 cite "permis", mais il faut ouvrir "+ Section libre", qui crée "Informations complémentaires" avec Titre, Sous-titre, Lieu, Début, Fin, Description (capture 04). Pour Gérard, c'est trop de champs pour écrire "Permis D". Le résultat final est bon (PDF). |
| P2-4 Bouton photo qui change de nom | **Non revérifié** | Je n'ai pas regardé le libellé après l'ajout. |
| P2-5 Étape Formation sans coche | **Non revérifié** | Je l'ai passée sans rien noter de nouveau. |
| P2-6 Catégorie de compétences vide | **Non testé** | Cette fois j'ai rempli la catégorie. |
| P2-7 Menu d'étapes sur deux lignes | **Toujours là** | Deux lignes de pastilles avant le formulaire (capture 03), mais le menu de haut de page reste collé à l'écran. |
| P2-8 Réouverture à l'étape 1, page défilée | **Améliorée, pas finie** | En portrait, "Reprendre" ouvre l'éditeur à l'étape 1 "Modèle" avec des miniatures de Nadia, pas mon CV (non conservé en capture). Je ne vois pas "Gérard" tout de suite. En paysage, le CV de Gérard est visible en direct à droite (capture 08) : là c'est rassurant. La page n'est plus défilée au milieu. |
| P2-9 CV d'exemple d'une développeuse | **Corrigée** | Exemple : vendeuse, accueil, caisse (captures 01 et 07). |

## Frictions restantes

### P0
Aucune.

### P1
1. **Réouverture à l'étape 1 "Modèle" en portrait** (retour, capture 07 puis réouverture). Je clique "Reprendre", je tombe sur des CV de Nadia et un choix de modèles. Je me demande si mon CV a disparu. Suggestion : ouvrir directement l'aperçu (ou l'étape 9, "Télécharger") quand un CV existe.
2. **Petits caractères partout** (captures 03 à 05). Onglets 12 px à chasse fixe, aides 14 px. Suggestion : 16 px pour tout texte qui explique, 14 px mini pour les onglets, police normale à la place de la mono.
3. **Permis D : trop de chemin** (capture 04). Suggestion : bouton "+ Permis de conduire" qui crée la section avec Titre prérempli ; ou une section libre simplifiée (Titre + une ligne).

### P2
1. **JSON encore visible** : "Exporter (JSON)" étape 9, "Importer (JSON)" et "Tout exporter (JSON)" dans Mes documents (captures 05). Suggestion : "Enregistrer une copie de sauvegarde".
2. **Mois abrégés** ("sept.", "déc.") dans les listes. Suggestion : mois entiers.
3. **Champs d'exemple gris** qui ressemblent à du texte rempli ("Nadia", "Perrin").
4. **"Masquer" et "×" sur chaque champ** d'identité, deux boutons de plus sans explication à droite de chaque ligne.
5. **Page "Mes documents"** : les infos "CV · Français · Modifié le 29/10/2026 09:20 · En cours d'édition" sont en petite police à chasse fixe (capture non conservée). Le lien d'en-tête "Modifier" y est ambigu.
6. **Photo petite** dans le CV (une quarantaine de pixels sur le PDF). La photo de test était une image simple, à vérifier avec une vraie photo.

## Ce qui m'a plu
- L'accueil au retour : "Reprendre mon CV, Gérard Dubreuil, modifié le…, enregistré dans ce navigateur, sur cet appareil" (capture 07). C'est ce qui manquait.
- Plus de page qui bouge de côté sur iPad.
- Les listes Mois / Année en français : je choisis au doigt, je ne tape rien (capture 03).
- Le CV d'exemple orienté vente et accueil.
- L'aperçu portrait avec bascule Modifier / Aperçu (capture 06), net et lisible, et le message "PDF téléchargé : CV-Gerard-Dubreuil.pdf".
- Le récapitulatif de l'étape 9 (nom, modèle, 3 expériences, Permis) et la phrase "rien n'est envoyé sur Internet" (capture 05).
- En paysage, le CV de Gérard se met à jour à droite (capture 08).

## Qualité du PDF obtenu
Une page A4, nette, nom en grand, trois expériences avec dates en français ("mars 2005 – déc. 2024", "sept. 1999 – févr. 2005", "juin 1994 – août 1999"), puces propres, "Compétences" avec "Savoir-être" rempli, rubrique "Permis" avec "Permis D (transport en commun)". Rien ne déborde. Le bas de page est vide, normal pour ce contenu. Photo en haut à droite, petite. Nom de fichier parlant.

## Note globale
8/10.

Je le recommanderais à un ami parce que mon CV est sorti propre en une page, que l'accueil me dit au retour que mon CV est enregistré sur l'appareil et que je peux le reprendre, mais le texte est encore trop petit à mon goût, "Reprendre" me ramène au choix des modèles, et pour le permis D il faut deviner "Section libre".
