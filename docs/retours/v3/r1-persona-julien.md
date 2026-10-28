# Ronde 1, Julien (recruteur, 38 ans)

## Qui
Julien, chargé de recrutement en cabinet, 80 CV par jour, un ATS. Desktop 1440x900, fr-FR. Il veut savoir s'il peut conseiller CVLove aux candidats.

## Parcours réalisé
- Accueil, puis éditeur `#/editeur`, clic sur « Remplir avec l'exemple ».
- 12 PDF téléchargés en français : Classique·Académique, Moderne·Bandeau, Minimal·Épuré, Créatif·Aplat, Chronologie·Frise, Compact·Dense, Exécutif·Doublé, Tableau·Dossier, Grille·Bandeau plein, Marge latérale·Capitales, Blocs·Pavé, Colonne pleine·Encre.
- 2 PDF en anglais (Compact·Dense, Marge latérale·Filet), après avoir changé « Langue du CV » en mode Complet. Un premier essai en changeant seulement la langue de l'interface n'a rien changé au CV (voir P1).
- Pour chaque PDF : lecture visuelle (page 1 convertie en PNG avec `sips`, pas de `pdftoppm` sur la machine) et extraction du texte avec pdfjs-dist (pas de `pdftotext`).

## Première impression (les 30 premières secondes)
Accueil clair : « Votre CV en PDF, sans compte et sans frais ». Je clique sur « Créer mon CV ». L'éditeur s'ouvre sur 36 vignettes et un aperçu à droite. « Remplir avec l'exemple » est un simple lien souligné, petit, mais je le trouve. En 10 secondes j'ai un CV complet. Le compteur « 0 requête vers un autre site » en bas me rassure : un candidat peut y mettre ses données. Le PDF sort en un clic, sans mur d'inscription. Bon point.

## Frictions

### P0
Aucun bloquant : les 14 PDF se téléchargent, se lisent, et le texte est extractible.

### P1
1. **Moderne·Bandeau : l'ordre de lecture ATS est faux.** Capture 03. Dans le texte extrait, la colonne latérale (Contact, Compétences, Langues, Centres d'intérêt) vient avant le nom et le poste. Un ATS lit « Contact, Né(e) le..., Compétences... » puis seulement « Camille Marchand ». Risque : nom ou poste mal reconnus. Suggestion : écrire le bloc nom/poste/profil/expériences d'abord dans le flux du PDF, la colonne latérale ensuite, même si elle s'affiche à gauche.
2. **Exécutif·Doublé : le nom est découpé.** Capture 04. L'extraction donne `C|AMILLE|M|ARCHAND` : les petites capitales sont faites avec une première lettre plus grande et le reste en majuscules réduites, donc en morceaux séparés. Un ATS peut lire « C AMILLE M ARCHAND », et la recherche de « Marchand » dans le PDF échoue. Suggestion : écrire le nom en un seul bloc de texte, ou en vraies capitales.
3. **Blocs·Pavé : une page 2 pour une seule section.** Capture 06. Le CV tient presque sur une page, mais « Centres d'intérêt » (3 lignes) passe seul sur la page 2. Il restait de la place en bas de la page 1. Pour moi, une page 2 avec 3 lignes dit « CV mal fait ». Suggestion : tolérance sur le bas de page, ou ne pas couper un bloc quand il manque quelques points.
4. **Langue du CV : l'exemple reste mi-français mi-anglais.** Quand je passe en anglais, les titres et les dates changent (« Work experience », « Mar 2021 – Present », « Born June 12, 1994 »), mais profil, intitulés, puces et « Développeuse web full-stack » restent en français. L'aide dit « jamais votre texte », donc c'est voulu, mais le PDF d'exemple en anglais est un mélange. En plus, changer la langue de l'interface en English ne change pas la langue du CV : je pensais obtenir un CV anglais. Suggestion : sur la langue du CV, proposer l'exemple traduit, et lier ou expliquer les deux réglages.
5. **Date de naissance dans l'exemple.** Tous les PDF affichent « Né(e) le 12 juin 1994 » en tête. Pour un candidat français, c'est déconseillé (discrimination à l'âge, RGPD) et je ne veux pas voir ça. Suggestion : ne pas la mettre dans l'exemple, ou ajouter une aide « inutile en France ».

### P2
6. **Barres de niveau sur les compétences et les langues** (Marge latérale, Chronologie, Blocs, Grille, Colonne pleine, Moderne·Marge). Elles sont dessinées, pas du texte : aucun effet ATS, bien. Mais côté recruteur, « React 4/5 » sans repère ne veut rien dire, et j'ai déjà « Courant (C1) » juste à côté. Suggestion : option « sans barres » visible à côté du modèle, ou barres désactivées par défaut.
7. **Grille·Bandeau plein ne suit pas l'ordre des sections.** Capture 07. Projets passe avant Formation, Compétences et Formation sont côte à côte. Pas faux, mais l'ordre d'un CV bien construit (expérience, formation, compétences) saute.
8. **Marge latérale·Capitales : le contact n'a pas de titre.** Capture 05. Le bloc « Né(e) le..., Lyon, e-mail, téléphone » flotte en haut de la colonne de droite sans titre. Lisible mais flou à 6 secondes.
9. **Noms des modèles incohérents.** En français : « Classique · Académique ». Quand l'interface est en anglais : « Classic 1, Classic 2... ». Aucun nom ne me dit à quoi sert le modèle (lecture ATS, nombre de colonnes).
10. **Rien n'indique quel modèle est « compatible ATS ».** Les filtres sont catégorie, colonnes, photo. Un candidat ne sait pas que 2 colonnes (Moderne·Bandeau, Colonne pleine·Encre) est plus risqué qu'une colonne.
11. **Rendu 2 pages peu testé.** L'exemple tient sur une page dans 11 modèles sur 12 ; je n'ai pas pu juger les sauts de page avec un vrai CV long (3 expériences et plus). À vérifier au tour suivant avec un CV chargé.

### Ce qui manque pour un recruteur
- **Intitulé de poste visé** : le seul champ est « Intitulé du poste » (sous le nom). Pas de ligne « Je cherche : ... » distincte de l'intitulé actuel.
- **Mobilité, disponibilité, permis, prétentions** : seulement un champ « personnalisé » libre ; rien de guidé.
- **Liens** : un seul champ « site web ». Pas de LinkedIn ni GitHub dédiés. Je veux un lien cliquable lisible (`linkedin.com/in/...`).
- **Dates** : les mois sont en lettres abrégées (« sept. 2018 – févr. 2021 »), lisibles. En mode Chronologie, la date est avant le titre du poste dans le texte extrait (ex. « mars 2021 – Présent | Développeuse... ») : un ATS peut lier la date au bon poste, mais l'ordre change d'un modèle à l'autre.

## Ce qui m'a plu
- Texte 100 % extractible dans les 14 PDF : pas d'image, pas de caractères cassés, accents corrects, aucune coquille repérée.
- Le texte sort dans le bon ordre sur 10 modèles sur 12 (colonne unique ou colonne latérale placée après le contenu principal) : Classique, Minimal, Créatif, Chronologie, Compact, Tableau, Grille, Marge latérale, Colonne pleine.
- Hiérarchie claire à 6 secondes sur Classique·Académique, Minimal·Épuré, Compact·Dense, Tableau·Dossier : nom, poste, puis dernière expérience en tête.
- Rendu fin : dates alignées à droite, puces propres, titres de section nets, pas de débordement.
- Confidentialité : « 0 requête vers un autre site » avec lien pour vérifier.

## Qualité du PDF obtenu
Lisibilité (6 secondes) : bonne partout, meilleure en une colonne.
Texte extractible : oui, 14/14.

À conseiller (lecture ATS fiable, une colonne ou ordre correct) :
- **Classique·Académique** (capture non retenue) : nom en tête, titres standards, dates à droite.
- **Minimal·Épuré**, **Compact·Dense** (dense, tient sur peu de place, utile pour CV longs), **Tableau·Dossier** (titres en marge, texte extrait cohérent), **Exécutif·Doublé** si le nom est réparé (P1.2).
- **Chronologie·Frise** (capture 08) : lisible et agréable, la frise aide à lire la carrière ; barres de niveau à retirer.

À déconseiller ou à réparer :
- **Moderne·Bandeau** : ordre ATS faux (P1.1).
- **Blocs·Pavé** : page 2 orpheline (P1.3), et les cartes colorées sont jolies mais lourdes.
- **Colonne pleine·Encre** : fond bleu pleine hauteur en colonne gauche, bien pour un humain, mais à imprimer en noir et blanc c'est un aplat.
- **Grille·Bandeau plein** : l'ordre des sections bouge.
- Tous les modèles à barres de niveau, si le candidat veut éviter l'auto-notation.

## Note globale
**7/10.** Je le recommanderais à un candidat parce que le texte est propre et extractible, la confidentialité est claire et 5 ou 6 modèles sont solides pour un ATS, mais je lui dirais de choisir à la main un modèle une colonne et d'éviter l'exemple tel quel (date de naissance, barres de niveau), car rien dans l'outil ne l'avertit.
