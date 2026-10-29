# Ronde 3, persona Marc

## Qui
Marc, 46 ans, ancien chef de rayon, se reconvertit en logistique. PC portable 1366x768, fr-FR, peu à l'aise, pressé. 4 expériences longues (7 à 10 puces), un CAP, un CACES. Il a testé la ronde 1 ; cette ronde reprend le même parcours avec un accent sur la lettre de motivation.

## Parcours réalisé
Accueil, "Créer mon CV", bascule en Complet, saisie identité, profil, 4 expériences avec dates, 2 formations, compétences, langues. Retour en Guidé, filtre "Simple", "Minimal · Épuré", étape 9, téléchargement du CV (2 pages). "Créer la lettre assortie" : destinataire, objet, corps (zone vide avec trame grisée, puis "Remplir avec l'exemple", puis mon propre texte), design, téléchargement. Puis Mes documents, "Nouvelle lettre" (choix "CV source"), corps court, téléchargement. Tout a abouti, aucun blocage. Molette testée à fond (40 coups de chaque côté) sur l'éditeur et la lettre : la page ne bouge plus.

## Première impression (les 30 premières secondes)
Même accueil clair : "Votre CV en PDF, sans compte et sans frais", gros bouton noir (capture 01). L'aperçu montre maintenant "Nadia Perrin, conseillère de vente" au lieu d'une développeuse : je me reconnais mieux, ancien chef de rayon. Dans l'éditeur, trois boutons "Remplir avec un exemple : Vente et accueil / Premier emploi / Informatique" (capture 02) : je clique sans hésiter sur le premier. L'étape "Modèle" avec 36 vignettes fait toujours un peu peur, mais "Passer cette étape" est là.

## Suivi des frictions de la ronde 1

| # | Friction (ronde 1) | Statut | Ce que j'ai vu |
|---|---|---|---|
| 1 | P0 : la page entière défile, écran gris vide | **Corrigée** | scrollY reste à 0 et la hauteur du document reste à 768, après 40 coups de molette à gauche et à droite, en Guidé et sur la lettre. Plus de bande vide. |
| 2 | P1 : la lettre démarre vide, sans aide | **Améliorée** | Zone de saisie avec trame grisée en trois temps (pourquoi cette entreprise, ce que vous apportez, votre disponibilité) et bouton "Remplir avec l'exemple" (capture 05). Mais l'aperçu reste presque vide tant qu'on n'a pas écrit, et l'exemple ne me va pas (voir F1 et F2 ci-dessous). |
| 3 | P1 : aucun repère de page dans l'aperçu | **Corrigée** | Les deux feuilles sont séparées dans l'aperçu et "2 pages" est écrit sous la feuille (capture 03). |
| 4 | P1 : deux libellés "Niveau" | **Corrigée** | "Niveau sur 5" pour la liste, "Niveau en toutes lettres" pour le texte. La "Catégorie" des compétences reste sans exemple, mais je comprends "Logistique". |
| 5 | P1 : Exporter dans Mes documents | **Toujours là** | Même écran : cinq boutons par ligne, "Exporter" sans mot "PDF" ni "JSON", pas de vignette, intro qui parle de CV seulement (capture 08). Seule nouveauté : "Nouvelle lettre" propose "CV source". |
| 6 | P2 : "Lettre 2" pour la première lettre | **Améliorée** | La première s'appelle "Lettre · Marc Delorme", la seconde "Lettre 2 · Marc Delorme" : logique. Le CV s'appelle toujours juste "Marc Delorme". |
| 7 | P2 : lettre pas vraiment assortie | **Améliorée, pas finie** | Le nom est orange sur la lettre, le titre de poste est orange sur le CV Minimal · Épuré, donc la même couleur d'accent. Mais le CV a le nom noir et les titres en capitales grises ; la lettre met le nom en orange et "Objet" en orange. Aucun lien avec le modèle choisi. |
| 8 | P2 : poste coupé entre les deux pages | **Toujours là** | Dans le PDF, le dernier poste "Employé libre-service" a 3 puces en bas de page 1, les 4 autres en haut de page 2, sans en-tête de poste (capture 04 pour la page 1 ; la page 2 reprend la suite dans l'aperçu, capture 03). |
| 9 | P2 : filtres de modèles | **Toujours là** | Trois lignes de filtres sans titre, noms de modèles abstraits. Les 3 exemples métier en haut aident un peu, mais pas pour choisir un modèle. |
| 10 | P2 : bascule Guidé / Complet | **Toujours là** | Aucun libellé de plus. Mineur. |
| 11 | P2 : étape "Autres" | **Non réévaluée** | Pas ouverte. |

## Frictions nouvelles

### P1
**F1. L'exemple de lettre n'est pas pour moi.** Où : `#/lettre`, bouton "Remplir avec l'exemple" (capture 06). Ce qui se passe : il écrit "Votre annonce pour un poste de conseillère de vente… Je serais heureuse… Maison Duval… Madame Lambert, Boutique Aurore, 8 rue de la République, Lyon, objet : conseillère de vente". Féminin, commerce, autre ville. Il garde mon nom et mes coordonnées, c'est bien, mais je dois tout réécrire : le texte, le destinataire, l'objet. Si j'oublie un mot, j'envoie une lettre où il est question de Lyon. Suggestion : 3 exemples comme sur le CV (vente, logistique, premier emploi) et accord masculin/féminin neutre ("ravi" ou formulation sans accord), ou un avertissement "remplacez le texte en gris".

**F2. Le bouton "Remplir avec l'exemple" disparaît dès qu'on a tapé quelque chose.** Où : `#/lettre`. Ce qui se passe : j'ai saisi le destinataire, puis je suis allé à l'étape Corps : plus de bouton. Il n'est donc proposé qu'au tout début, avant que je sache à quoi il sert. Suggestion : le garder visible sur l'étape Corps tant que le corps est vide.

### P2
**F3. Une lettre neuve de zéro reste presque vide.** Où : "Nouvelle lettre" depuis Mes documents, "CV source". Ce qui se passe : mes coordonnées sont reprises, la zone Corps a sa trame grisée et l'exemple est proposé, donc ce n'est plus décourageant. En revanche l'aperçu n'a que "Madame, Monsieur," et "Je vous prie d'agréer…" (capture 05) ; avec 2 lignes tapées, le PDF fait une lettre de 1/3 de page. Aucun repère de longueur. Suggestion : un compteur de mots ou une indication "une lettre fait 150 à 250 mots".

**F4. "Bonjour," tapé dans le corps s'ajoute après "Madame, Monsieur,".** Où : lettre téléchargée depuis "Nouvelle lettre" (capture 07 pour la forme, double formule vue dans le PDF). Ce qui se passe : j'ai commencé par "Bonjour," car je ne lis pas les petites lignes d'aide, et le PDF affiche "Madame, Monsieur," puis "Bonjour,". L'aide sous la zone le dit mais en gris, en petit. Suggestion : déplacer l'avertissement au-dessus de la zone, ou retirer une formule d'appel redondante à la détection.

**F5. "Madame Leroux" saisi comme destinataire ne change pas la formule d'appel.** Où : étape Objet, champ "Formule d'appel" qui reste sur "Madame, Monsieur,". Je dois comprendre qu'il faut la changer moi-même. Suggestion : proposer "Madame Leroux," quand un nom commençant par Madame/Monsieur est saisi.

**F6. Le filet sous l'en-tête est orange à l'écran et gris dans le PDF.** Où : lettre, aperçu contre PDF (captures 05, 07). Mineur, mais l'aperçu n'est pas fidèle.

**F7. Vignettes de modèles avec "Nadia Perrin" plutôt que mes données.** Où : étape Modèle et Design du CV (capture 03, colonne de gauche). Je choisis un modèle sur le nom d'une autre personne. Suggestion : afficher mes données dans les vignettes dès que j'ai commencé à saisir.

## Ce qui m'a plu
- Plus de page qui part dans le vide quand je molette : je peux enfin travailler sans peur.
- L'aperçu du CV sépare les pages et affiche "2 pages".
- Le CV d'exemple "Vente et accueil" est proche de mon métier.
- "Nouvelle lettre" reprend mes coordonnées, et propose de partir de zéro si je ne veux pas du CV.
- La trame grisée dans la zone Corps me dit quoi écrire en trois phrases.
- "0 requête vers un autre site" en bas : mes données restent chez moi.
- Noms de fichiers corrects : `CV-Marc-Delorme.pdf`, `Lettre-Marc-Delorme.pdf`.

## Qualité du PDF obtenu
CV : 2 pages A4, Minimal · Épuré, nom noir en gros, titre de poste orange, titres en capitales grises, dates à droite, puces propres, accents corrects (capture 04). Lisible et sobre. Défaut : le dernier poste est coupé en plein milieu (3 puces page 1, 4 puces page 2 sans en-tête de poste). Je n'ai pu ouvrir que la page 1 en image ; la page 2 vue via l'aperçu à l'écran.

Lettre 1 (avec l'exemple remplacé par mon texte) : 1 page, en-tête avec nom orange, titre, coordonnées, filet gris ; destinataire aligné à droite avec adresse (Madame Leroux, Transports Duval, Rouen), date, objet orange, corps en trois paragraphes, formule de politesse, signature. Propre et professionnelle (capture 07). Une grande partie de la page reste blanche, normal pour un texte court. Le "Madame, Monsieur," est resté alors que je m'adressais à Madame Leroux.

Lettre 2 (depuis Mes documents, 2 phrases) : 1 page, en-tête identique, mais "Madame, Monsieur," suivi de "Bonjour," et d'une seule ligne de texte. Plus de 2/3 de la feuille vide : on voit que le travail n'est pas fini, l'outil ne prévient pas.

## Est-ce encore vide et décourageant ?
Beaucoup moins qu'en ronde 1 : la trame grisée et l'exemple enlèvent la page blanche. L'impression de vide reste dans l'aperçu à droite tant que je n'ai rien écrit (un papier avec seulement "Madame, Monsieur," et la formule de politesse), et l'exemple trop commercial et féminin me renvoie à "ce n'est pas fait pour moi".

## Note globale
**8 / 10.** Je le recommanderais à un ami parce que le CV sort propre en 15 minutes, que la page ne part plus dans le vide et que la lettre propose une trame et un exemple, mais il faut lui dire de remplacer entièrement le texte d'exemple (féminin, vente, Lyon), de ne pas écrire "Bonjour," dans le corps, et de ne pas compter sur "Exporter" dans Mes documents pour récupérer son PDF.

## Limites de ce test
Chromium headless : pas d'avis sur le rendu des champs date natifs. Je n'ai pas cliqué sur "Exporter" ni ouvert l'étape "Autres". Page 2 du PDF du CV non convertie en image (pas de `pdftoppm`, `sips` ne lit que la page 1). Pas de test mobile.
