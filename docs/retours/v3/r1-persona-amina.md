# Ronde 1, persona Amina

## Qui
Amina, 31 ans, graphiste UI freelance, bilingue français/arabe. MacBook 1440x900, thème sombre, locale fr-FR. Elle compare avec Canva et Mon CV Parfait. Elle regarde la typographie, les espacements, les alignements, le rendu arabe.

## Parcours réalisé
- Accueil, catalogue de 36 modèles, clic sur « Commencer avec ce modèle » (Moderne · Bandeau).
- Éditeur en mode Complet : identité, 5 coordonnées, profil, 2 expériences, 2 formations, compétences, langues, projet, centres d'intérêt, photo PNG de test, date de naissance.
- 8 modèles essayés avec mes infos : Classique · Académique, Moderne · Bandeau, Moderne · Nuit, Créatif · Pastel, Chronologie · Frise, Colonne pleine · Encre, Grille · Bandeau plein, Tableau · Dossier. Puis changement de couleur (Violet, Bleu) et de police (Lora + Inter, Source Serif, Playfair, Montserrat).
- Passage de l'interface et du CV en arabe (RTL), saisie de tout le contenu en arabe, 5 modèles arabes essayés (classique 1, colonne latérale 1, chronologie 1, exécutif 2, moderne 1).
- Deux PDF téléchargés : `CV-Amina-Benali.pdf` (Moderne · Bandeau, bleu) et `CV-ا-مينة-بن-علي.pdf` (arabe). Convertis en PNG et regardés.
- Je n'ai pas fait les 9 étapes du mode Guidé en entier : j'ai regardé la première (choix du modèle) et je suis passée en Complet.

## Première impression (les 30 premières secondes)
Sombre, sobre, net. La DA est cohérente : fond noir, titre serré, grille de feuilles en filigrane, un cœur rouge. Ça ressemble à un outil de dev, pas à un outil de design. Le hero montre un seul CV (Camille Marchand) et quatre onglets ; aucune photo, aucune couleur forte, aucun modèle expressif au-dessus de la ligne de flottaison. Face à Canva, qui montre tout de suite des CV colorés et variés, je ne vois pas ce que je gagne en quatre secondes. La promesse « sans compte et sans frais » est claire et crédible, avec « 0 requête vers un autre site » en pied d'éditeur, qui rassure. Mais « fait par un dev pour des devs » : je me demande si c'est pour moi.

## Frictions

### P0
- Aucune au sens bloquant : tout fonctionne et les deux PDF sortent. (Une erreur console « Loading aborted » dans `pdf-*.js` à la navigation, sans effet visible.)

### P1
1. **Rendu arabe : chiffres et puces.** Où : PDF arabe, section Expérience. Dans « رفع التقييم من ٣٫٨ إلى ٤٫٦ » et « ٣٠٪ », les chiffres arabo-indiens sortent en gras et déformés, avec une casse différente du texte autour. Les puces de description n'apparaissent pas du tout en arabe (en français, elles sont là), donc la liste perd sa structure ; la dernière ligne de l'expérience est décalée par rapport aux autres. Capture : `r1-amina-08.jpg`, `r1-amina-06.jpg`. Suggestion : tester une police arabe avec chiffres indiens cohérents, remettre une puce côté début en RTL.
2. **Les modèles en arabe perdent leur nom.** Où : galerie quand l'interface est en arabe : « كلاسيكي 1, 2, 3 », « شبكة 1, 2, 3 ». Je ne sais plus lequel est « Académique » ou « Bandeau », je ne peux plus comparer avec ce que j'ai choisi en français. Capture : `r1-amina-05.jpg`. Suggestion : traduire ou translittérer les 36 noms.
3. **Changer de modèle écrase la couleur et la police choisies.** Où : galerie. Un clic sur un modèle applique son préréglage (`preset`), donc ma couleur et ma police repartent à zéro. Le PDF arabe est sorti en terracotta alors que j'étais en bleu dans le CV français. Je ne l'ai compris qu'en comparant les PDF. Suggestion : garder l'accent et la police de l'utilisateur, ou prévenir.
4. **L'exemple laisse des valeurs fantômes dans mon CV.** Où : « Remplir avec l'exemple » puis réécriture. Les niveaux de compétences et de langues (barres de 3 à 5 segments) restent : j'avais écrit « Langue maternelle » pour l'arabe et la barre est à 4 sur 5, incohérent. La date de naissance de Camille (12 juin 1994) reste dans le CV tant qu'on ne la remplace pas. Suggestion : vider les niveaux quand on remplace, ou ne les afficher que si choisis.
5. **Les vignettes de la galerie montrent « Camille Marchand », pas mon CV.** Où : galerie de l'éditeur. Je choisis à l'aveugle ; ce n'est pas le plus utile pour comparer mes vraies infos. En arabe, plusieurs vignettes étaient encore vides à la capture. Capture : `r1-amina-03.jpg`, `r1-amina-05.jpg`. Suggestion : rendre les vignettes avec mes données, ou ajouter un aperçu au survol.

### P2
1. **Nom de fichier arabe cassé.** Le PDF s'appelle `CV-ا-مينة-بن-علي.pdf` : « أمينة » est coupé en « ا-مينة ». Le tiret s'insère au milieu du mot (le hamza est traité comme un signe à retirer). Peu lisible pour une arabophone. Suggestion : garder les lettres arabes telles quelles.
2. **Dates sans contrôle.** Fin avant début acceptée sans avertissement (un faux enchaînement de dates m'a donné « sept. 2018 – sept. 2016 » dans le premier essai).
3. **Date dans le PDF français qui se coupe.** Moderne · Bandeau : « mars 2019 – / Présent » sur deux lignes, laid dans une page très propre.
4. **Catalogue de l'accueil.** La page d'accueil est longue, mais on y voit très vite 36 feuilles identiques dans leur logique (même Camille, mêmes lignes grises). Impression de « liste de variantes » plus que de choix. L'aperçu de la grille du catalogue met un moment à se peindre (vignettes grises au début d'un défilement rapide).
5. **Zone de modèles de 28 rem de haut avec 3 colonnes de vignettes de 5 cm.** Trop petit pour juger la typographie d'un modèle. Il faut passer à l'aperçu de droite à chaque clic.
6. **Pas de réglage fin dans l'aperçu.** Pas de glisser-déposer, pas de modification directe sur la page ; il faut retourner dans le formulaire.
7. **Mode Guidé : 9 étapes.** Pour une graphiste qui sait ce qu'elle veut, Complet va plus vite ; le Guidé est d'abord celui qui s'affiche, je dois le quitter à chaque nouveau document.

## Ce qui m'a plu
- Sobre, sans pub, sans compte. « 0 requête vers un autre site » et « Comment le vérifier » m'ont convaincue.
- Les modèles les plus structurés sont propres : Moderne · Nuit (bandeau marine, bonnes marges), Chronologie · Frise (filets et points bien alignés), Tableau · Dossier (titres en capitales à gauche, filets fins). Hiérarchie nom / poste / sections lisible dans chacun.
- Photo : ronde, bien recadrée, bien intégrée dans la plupart des modèles. Option carrée disponible.
- L'arabe tient : RTL complet, mise en page en miroir (aperçu à gauche, formulaire à droite), police arabe propre et lisible, titres en bonne place, interface arabe entièrement traduite (« تنزيل ملف PDF », « مستنداتي »).
- Mode sombre de l'interface : contraste correct, boutons clairs, focus visibles.
- Les PDF sont légers (31 à 55 ko) et sortent vite.

## Ce qui fait « template générique » / ce qui manque face à Canva
- Pas de couleur ni de forme forte : tout est en filets fins, bandeaux unis, un accent. Aucun modèle ne fait « portfolio de designer » (pas de grande typographie, pas de grille éditoriale, pas de pictos). Les 36 modèles se ressemblent par leur logique « sections empilées + filet ».
- 7 couleurs d'accent et 4 paires de polices : peu pour juger. Pas de choix de fond, de motifs, de pictogrammes, de logos.
- Pas d'éditeur sur la page : on ne bouge rien. Canva permet de déplacer un bloc.
- Pas de mode clair/sombre propre pour le CV lui-même (normal), mais pas non plus de variantes de mise en page pour 2 pages.
- Aucune preuve sociale ni aucun CV « de référence » qui donne envie.

## Qualité du PDF obtenu
- Français (Moderne · Bandeau, bleu, Lora + Inter) : une page A4, texte vectoriel net. Hiérarchie claire (nom en 24 pt, poste en bleu, titres de section avec filet). Espacements corrects. Défauts : demi-page vide en bas de la colonne latérale, date d'expérience coupée sur deux lignes. Le bleu s'applique à l'accent mais la colonne latérale est un lilas pâle, pas très bien accordé.
- Arabe (Moderne 1, terracotta) : une page, sidebar à droite, titres à droite, texte aligné à droite. Très lisible. Défauts : chiffres arabo-indiens en gras et déformés, puces absentes, ligne de description décalée. Dates en chiffres latins alors que le texte a des chiffres arabo-indiens : mélange non cohérent. Nom de fichier cassé.

## Note globale : 6,5 / 10
Je le recommanderais à un ami parce que c'est gratuit, sans compte, local, avec un arabe RTL sérieux ; mais je ne le recommanderais pas à une graphiste exigeante tant que les modèles restent aussi sages et que les chiffres et puces arabes ne sont pas réglés.

## Captures
- `r1-amina-01.jpg` accueil (hero, sombre)
- `r1-amina-02.jpg` catalogue de l'accueil
- `r1-amina-03.jpg` éditeur en mode sombre, Moderne · Bandeau violet, galerie
- `r1-amina-04.jpg` Créatif · Pastel avec mes infos
- `r1-amina-05.jpg` éditeur en arabe, noms de modèles génériques
- `r1-amina-06.jpg` modèle chronologie en arabe (chiffres et puces)
- `r1-amina-07.jpg` PDF français
- `r1-amina-08.jpg` PDF arabe
