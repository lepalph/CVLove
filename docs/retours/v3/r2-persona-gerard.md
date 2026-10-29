# Ronde 2 : Gérard (iPad)

## Qui
Gérard, 61 ans, ancien conducteur de bus, cherche un poste d'agent d'accueil à temps partiel. iPad simulé : 820×1180 en portrait, puis 1180×820 en paysage, tactile, fr-FR. Il lit mal les petits caractères, se méfie d'Internet et ne connaît pas PDF, JSON, modèle. Test sur http://localhost:4302, contexte neuf.

## Parcours réalisé
Accueil, "Créer mon CV", éditeur guidé : Identité (photo PNG de test), Profil, 3 expériences, Formation passée, Compétences, Autres sections (section libre "Permis D"), Design passé, Télécharger. Aperçu, téléchargement réel du PDF (`CV-Gerard-Dubreuil.pdf`, vérifié en image). Puis onglet fermé, nouvel onglet sur l'accueil, "Mes documents", puis "Créer mon CV" en paysage. Tout a fonctionné, aucune erreur.

## Première impression (les 30 premières secondes)
Captures 01 et 08. Le titre est grand et lisible : "Votre CV en PDF, sans compte et sans frais." Je comprends : un CV, gratuit. "PDF", je ne sais pas trop, mais je devine. "Tout se passe sur votre appareil" me rassure un peu, sans que je sache ce que ça veut dire pour mes données. Mais en haut à droite le bouton "Créer mon CV" est coupé par le bord de l'écran : on dirait que la page dépasse. Sous le titre, la ligne grise "Gratuit et open source · 7 langues · Sans inscription" est petite, en police à chasse fixe, et je ne la lis pas bien. "Open source", je ne sais pas ce que c'est. Ensuite je vois le CV d'une certaine Camille Marchand, développeuse : ça ne me parle pas, rien pour un conducteur de bus ou un accueil. La vraie promesse de confidentialité ("Vos données restent chez vous") est tout en bas, après 36 modèles : je ne la verrais jamais.

## Frictions

### P0
Aucun bloquant : j'ai pu faire un CV complet et le télécharger.

### P1
1. **Accueil, en-tête portrait : débordement horizontal.** À 820 px la page fait 853 px de large (mesuré). Le bouton "Créer mon CV" de l'en-tête est coupé (capture 01). Sur iPad, la page bouge de côté sous le doigt. Suggestion : passer l'en-tête en menu compact sous ~900 px ou laisser les liens passer à la ligne ; ne garder qu'un bouton principal.
2. **Retrouver son CV : aucun signe sur l'accueil.** Capture 07 vs 01. En revenant, l'accueil est identique à celui d'un inconnu : pas de "Reprendre mon CV de Gérard". Le bouton "Créer mon CV" rouvre bien mon CV (testé), mais le mot "Créer" me fait craindre de repartir de zéro. Le chemin "Mes documents" existe, il liste mon CV avec "Ouvrir" (capture 07), mais je ne sais pas que mon CV est dans l'appareil. Suggestion : si un CV existe, remplacer le bouton par "Reprendre mon CV (Gérard Dubreuil)" et afficher le dernier CV en carte.
3. **Vocabulaire technique au moment du téléchargement.** Capture 05 : "Exporter (JSON)", "Importer (JSON)", "Tout exporter (JSON)", "Tout effacer" en rouge juste à côté de "Télécharger le PDF". Je ne sais pas ce qu'est JSON, et "Tout effacer" est à portée de doigt. Suggestion : "Enregistrer une copie de sauvegarde (fichier)" ; mettre "Tout effacer" plus loin ou derrière une confirmation. Le texte de l'accueil sur "exportez votre CV dans un fichier puis réimportez-le" n'aide pas non plus.
4. **Réassurance sur les données trop discrète.** Le pied de page "0 requête vers un autre site · Comment le vérifier" (captures 02 à 06) est en police à chasse fixe et petit. Je ne comprends pas "requête". En revanche, "Tout reste sur votre appareil : rien n'est envoyé sur Internet" (capture 05) est limpide, mais à l'étape 9 seulement. Suggestion : cette phrase-là, en gros, dès l'accueil sous le bouton, et la reprendre dans le pied de page à la place de "0 requête".
5. **Étapes et petits textes en 12-14 px.** Les onglets d'étapes ("01 Modèle", etc.) sont en 12 px à chasse fixe (mesuré), les aides sous les champs et "Étape 2 sur 9" sont petits (captures 02, 04). Les cibles font 44 px de haut, c'est bien, mais le texte est trop petit pour Gérard. Suggestion : 16 px minimum pour tout ce qui explique, 14 px mini pour les onglets.
6. **Dates en anglais.** Dans mon test, les champs mois affichent "March 2005", "December 2024" (capture 04) alors que la page est en français. C'est peut-être le Chromium de test qui ignore la langue ; à vérifier sur un vrai iPad. Si c'est réel, c'est désorientant. Suggestion : tester sur Safari iOS, sinon proposer deux listes "Mois" et "Année".

### P2
1. **Champs d'exemple en gris qui ressemblent à du vrai texte.** "Camille", "Marchand", "Vendeuse", "Lyon, France" (capture 02). Je ne sais pas si c'est déjà rempli. Suggestion : placeholder plus clair, ou préfixe "Exemple : ".
2. **"Masquer" et "×" à côté de chaque champ** (capture 02). "Masquer" est ambigu, "×" paraît dangereux. Ils prennent de la place et se répètent cinq fois. Suggestion : les cacher dans un menu "Options" par champ.
3. **Permis D : pas évident.** Pas de rubrique "Permis". Il faut deviner "Autres sections", puis "+ Section libre", puis remplir Titre de la section et Titre (capture 03 étape Autres). L'aide dit bien "permis" mais je n'ai pas de bouton "+ Permis de conduire". Pour un chauffeur c'est un point central. Suggestion : bouton "+ Permis de conduire" prérempli.
4. **Le bouton de photo change de nom.** "Ajouter une photo" devient "Photo" après l'ajout (capture 03), avec "Retirer la photo". Je ne sais pas si je peux la changer. Suggestion : "Changer la photo".
5. **Étape Formation sautée : pas de coche, sans explication** (capture 05). Je me demande si j'ai raté quelque chose.
6. **Catégorie de compétences vide imprimée.** Ma saisie de "Savoir-être" sans élément donne un titre seul dans le CV (capture 06). C'est ma saisie, mais l'application laisse faire sans avertir.
7. **Le menu des étapes prend beaucoup de place** : 9 pastilles sur deux lignes avant tout contenu, il faut défiler pour voir le formulaire.
8. **Paysage** (capture 08) : le mode bureau à deux colonnes apparaît, c'est bien et le CV se voit en direct. Mais l'éditeur rouvre à l'étape 1 "Modèle" au lieu de là où j'en étais, et la page est déjà défilée au milieu. Pour reprendre, je ne vois pas mon CV tout de suite en tête de page.
9. **Accueil : le CV d'exemple est celui d'une développeuse**, avec "LCP", "React", "TypeScript". Rien pour Gérard.

## Ce qui m'a plu
- Le titre de l'accueil, gros et clair. "Sans compte et sans frais" répond à ma peur.
- Les champs sont hauts (44 px) et en 16 px, faciles à toucher et à lire. Pas de zoom automatique de l'iPad.
- Le guidé en 9 étapes, avec des phrases d'aide simples ("Seul le nom est utile", "Pas encore d'emploi ?").
- L'aperçu qui se met à jour, et la vue portrait avec bascule Modifier / Aperçu : le format tablette passe en mode mobile en portrait, c'est adapté et lisible. Le bouton "Agrandir l'aperçu" aide.
- Le message "PDF enregistré : CV-Gerard-Dubreuil.pdf" après le clic (capture 06), qui confirme.
- La page "Mes documents" est claire : mon nom, la date, "Ouvrir" (capture 07).
- Le récapitulatif de l'étape 9 et la phrase "Tout reste sur votre appareil : rien n'est envoyé sur Internet".

## Qualité du PDF obtenu
Une page A4, nette, nom en grand, photo ronde en haut à droite, trois expériences avec dates en français (mars 2005 – déc. 2024), puces propres, rubrique "Permis" avec "Permis D (transport en commun)". Rien ne déborde. La seule faille vient de ma saisie : "Compétences" avec un titre sans contenu. Le bas de la page est vide, normal pour ce contenu. Le nom du fichier est parlant.

## Note globale
7/10.

Je le recommanderais à un ami parce que le CV est sorti propre, vite et gratuit, mais l'accueil ne rassure pas assez sur mes données, le vocabulaire (JSON) fait peur, et en revenant on ne retrouve pas son CV d'un coup d'œil.
