# Ronde 1, persona Marc

## Qui
Marc, 46 ans, ancien chef de rayon, se reconvertit en logistique. PC portable 1366x768, fr-FR. Peu à l'aise, pressé : un CV propre en 15 minutes, puis une lettre. 4 expériences longues, un CAP, un CACES.

## Parcours réalisé
Accueil, "Créer mon CV", éditeur, bascule en Complet, saisie de l'identité, du profil, de 4 expériences (7 à 10 puces pour les plus récentes), de la formation, des compétences et des langues. Essai du Guidé, filtre "Simple", choix de "Minimal · Épuré", étape 9, téléchargement du PDF (2 pages), "Créer la lettre assortie", 5 étapes de la lettre, téléchargement, puis Mes documents. Tout a abouti, aucun blocage dur. Temps réel pour un humain : environ 15 minutes, plus si l'on hésite sur les libellés.

## Première impression (les 30 premières secondes)
L'accueil est clair : "Votre CV en PDF, sans compte et sans frais", un gros bouton noir, un aperçu de CV à droite. Je comprends tout de suite. Rassurant. En revanche l'aperçu montre "Camille Marchand, développeuse full-stack" : ce n'est pas mon métier, je me demande si c'est fait pour moi (capture 01). Le bouton mène à l'éditeur en mode Guidé, étape "Modèle" : on me demande de choisir une mise en page avant d'avoir écrit un mot, avec 36 vignettes. Un peu de vertige, "Passer cette étape" me sauve. Le bandeau "Exemple. Vos informations le remplacent dès que vous commencez à écrire" aide.

## Frictions

### P0
**1. La page entière défile et finit sur un écran vide (éditeur Guidé, 1366x768).** Où : `#/editeur` en Guidé (et `#/lettre`). Ce qui se passe : le document fait plus que la fenêtre (1179 px à vide, 2187 px avec mon CV, pour 768 de haut). Quand la molette arrive au bout du panneau de gauche, c'est toute la page qui descend. Mesuré : scrollY 1419 après quelques coups de molette, et l'écran est entièrement gris, sans rien (capture 04). Plus modestement, un simple clic sur "Créer la lettre assortie" ou sur l'étape "Télécharger" décale la page et laisse une bande vide sous la barre du bas, avec le titre de l'étape coupé (capture 03, idem sur la lettre). Marc croit que l'appli a planté. En Complet, la molette n'a pas provoqué ce défilement dans mon test. Suggestion : bloquer le défilement du document (`overflow: hidden` sur le conteneur app, `overscroll-behavior: contain` sur les panneaux), et trouver pourquoi le document est plus haut que la fenêtre (un bloc de mesure PDF hors écran ?).

### P1
**2. La lettre démarre vide, sans aide à l'écriture.** Où : `#/lettre`, étape 4 "Corps" (capture 05). Ce qui se passe : une grande zone blanche, aucun exemple grisé, pas de bouton "Remplir avec l'exemple" (qui existe sur le CV), pas de trame. L'aperçu affiche seulement "Madame, Monsieur," puis directement "Je vous prie d'agréer…" et ma signature. Pour quelqu'un qui n'a pas écrit une lettre depuis 20 ans, c'est décourageant : je ne sais pas par où commencer. Suggestion : pré-remplir un modèle de lettre éditable à trous (ex. "Après X ans comme …, je souhaite …"), ou proposer 2 ou 3 trames par situation (reconversion), et un compteur de lignes pour tenir sur une page.

**3. Aucun repère de page dans l'aperçu du CV.** Où : éditeur, aperçu à droite (capture 02). Ce qui se passe : avec 4 expériences longues, la feuille est continue ; seul un grand blanc avant "Formation" trahit le saut de page, sans trait, sans "Page 1 / 2", sans nombre de pages. Je ne sais pas si mon CV fait 2 pages avant de télécharger. Suggestion : séparer visuellement les pages et afficher "2 pages" près du bouton de téléchargement.

**4. Deux libellés "Niveau" pour des choses différentes.** Où : section Langues, mode Complet (capture 02). Ce qui se passe : une liste "Niveau : Aucun" et, juste dessous, une zone de texte aussi étiquetée "Niveau" où j'ai tapé "Langue maternelle". Même confusion pour Compétences : le champ de texte s'appelle "Compétences" dans la section "Compétences" et une "Catégorie" m'est demandée, ce qui n'est pas évident ("Logistique", "Permis" ?). Suggestion : renommer en "Niveau (liste)" et "Précisions", et mettre un exemple en gris adapté à un métier non technique (les exemples actuels sont ceux d'une développeuse).

**5. Mes documents : Exporter n'est pas "télécharger le PDF".** Où : `#/documents` (capture 07). Ce qui se passe : cinq boutons par ligne (Ouvrir, Dupliquer, Renommer, Exporter, Supprimer), l'intro parle seulement de CV, pas de PDF ni de lettres, pas d'aperçu. Ailleurs "Exporter (JSON)" est écrit explicitement, ici non ; je n'ai pas cliqué mais je m'attends à un PDF. Un mot comme "JSON" ne parle pas à Marc. Suggestion : bouton "Télécharger le PDF" sur chaque ligne, "Sauvegarder (fichier)" à la place d'"Exporter", et une vignette.

### P2
**6. Nom de la lettre : "Lettre 2" alors que c'est la première.** Où : Mes documents. Vérifié sur un contexte neuf : le CV s'appelle "CV sans titre" et la lettre "Lettre 2". Le CV de Marc s'appelle "Marc Delorme" sans mention "CV" dans le titre. Suggestion : "Lettre 1", ou "Lettre · Transports Duval" dès qu'un destinataire est saisi.

**7. "Assortie" n'est pas vraiment assortie.** Mon CV Minimal · Épuré a un nom noir et des titres gris en capitales ; la lettre a un nom orange, un filet orange et "Objet" orange. Les trois mises en page ("Classique, Bandeau, Latérale") ne se rattachent pas aux modèles du CV. Marc s'attend à la même allure. Suggestion : reprendre couleur, police et style du modèle choisi.

**8. Début de la dernière expérience coupé sur deux pages.** Où : PDF, saut entre page 1 et 2 (capture 06). Les 2 dernières puces de "Préparateur de commandes" se retrouvent seules en haut de la page 2, sans en-tête de poste. Lisible, mais peu propre. Suggestion : empêcher de laisser moins de 3 puces seules, ou repousser le poste entier. Page 2 sans nom ni numéro.

**9. Vocabulaire des filtres de modèles.** "Tous / Classique / Moderne / Créatif / Simple", puis "1 colonne / 2 colonnes", puis "Avec photo / Sans photo" : trois lignes de filtres sans titre. "Simple" et "Minimal" se recoupent, et les noms de modèles ("Chancellerie", "Gazette", "Marginalia", "Greffe", "Registre") ne disent rien à Marc. Avec ses 36 vignettes, il choisit au hasard. Suggestion : "Pour quel poste ?" (administratif, terrain, cadre) avec 3 recommandations.

**10. Bascule Guidé / Complet sans explication.** Le mode par défaut est Guidé, mais en Guidé on ne voit pas les autres réglages, et le passage à Complet change toute l'organisation. Un libellé "Étape par étape" / "Tout sur une page" serait plus parlant. Mineur.

**11. Étape "Autres" (07) :** le libellé de la barre est "Autres", le titre de section "Autres sections". Pas ouvert, pas évalué.

## Ce qui m'a plu
- L'aperçu se met à jour pendant que je tape, et la page ne se recharge jamais.
- "0 requête vers un autre site" en bas : je comprends que mes données restent chez moi.
- La saisie des puces avec "-" est simple, l'aide sous la zone le dit.
- Le PDF est propre, sobre, lisible, rapide à générer (nom de fichier "Lettre-Marc-Delorme.pdf" correct).
- "Créer la lettre assortie" reprend mes coordonnées sans que je les retape.
- "Passer cette étape" rassure quand on ne sait pas.

## Qualité du PDF obtenu
CV : 2 pages A4, modèle Minimal · Épuré, bonne lisibilité, titres en capitales grises, dates alignées à droite, puces propres, accents et "€" corrects. Pagination correcte hormis la coupe en milieu de poste. Page 2 mi-vide, sans en-tête (capture 06). Métadonnées : titre et auteur "Marc Delorme". Lettre : 1 page, en-tête avec filet, destinataire à droite, objet, signature. Lisible et professionnelle, mais blanc au-dessus de la signature et formule "Madame, Monsieur," même quand j'ai écrit "Madame Leroux" (capture non prise, vu dans le PDF).

## Note globale
**7 / 10.** Je le recommanderais à un ami parce que le CV sort propre et vite, sans compte, mais il faut lui dire de ne pas trop faire défiler la page à la molette dans l'éditeur Guidé et de préparer son texte de lettre avant, car l'outil ne l'aide pas à l'écrire.

## Limites de ce test
Navigateur headless Chromium : l'affichage des champs "mois" en anglais ("June 1998") est probablement lié à l'environnement et n'est pas compté comme friction. Je n'ai pas testé le Complet pour la molette au-delà de 12 coups ni la vue mobile. Je n'ai pas cliqué sur "Exporter" de Mes documents.
