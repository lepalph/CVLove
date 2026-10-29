# Ronde 3, persona Amina

## Qui
Amina, 31 ans, graphiste UI freelance, bilingue français/arabe. MacBook 1440x900, thème sombre, fr-FR. Elle a testé la ronde 1 (6,5/10) et revient vérifier ses frictions. Elle regarde la typographie, les espacements, les alignements, le rendu arabe.

## Parcours réalisé
- Accueil, catalogue (défilement), éditeur en mode Complet.
- Saisie de mes vraies infos : identité, photo PNG générée, 5 coordonnées, profil, 2 expériences (dont une « en cours »), 2 formations, 2 catégories de compétences, 3 langues.
- Violet + Playfair Display choisis, PUIS changement de modèle sur 6 : Classique · Académique, Moderne · Bandeau, Moderne · Nuit, Créatif · Pastel, Chronologie · Frise, Grille · Bandeau plein. Un PDF téléchargé par modèle.
- Nouveau CV en arabe (contenu arabe avec chiffres arabo-indiens), interface et CV en arabe, deux PDF arabes (Grille · Bandeau plein, Moderne · Bandeau).
- Retour au CV français, interface en français, PDF final (Moderne · Bandeau, violet, Playfair).
- PDF lus en PNG rendu à partir du fichier (texte extrait aussi avec pdfjs).

## Première impression (les 30 premières secondes)
Toujours sombre, sobre, net, grille en filigrane. Le hero montre maintenant « Nadia Perrin » en Classique avec quatre onglets (Classique, Moderne, Minimal, Créatif) qui changent la mise en page : « Mêmes informations, quatre mises en page » dit tout en une ligne. C'est plus parlant qu'en ronde 1. Mais le CV de démo reste blanc sur noir, sans photo ni couleur forte. Face à Canva, je ne suis pas encore séduite en quatre secondes. La promesse « sans compte et sans frais » passe bien. Capture `r3-amina-01.jpg`.

## Suivi des frictions de la ronde 1

| # | Friction (ronde 1) | État | Ce que j'ai vu |
|---|---|---|---|
| P1-1 | Chiffres arabes en gras et déformés | **Corrigée** | Chiffres arabo-indiens (١٢٠, ١٨٪, ٣٫٨, ٤٫٦, ٣٠٠) au même poids que le texte, lisibles. Reste un décalage voir F2. `r3-amina-06.jpg` |
| P1-1 | Puces absentes en arabe | **Corrigée** | Une puce par ligne, côté début (à droite), retrait régulier, plus de ligne décalée. `r3-amina-08.jpg` |
| P1-2 | Modèles arabes « كلاسيكي 1, 2, 3 » | **Améliorée** | La famille est traduite (كلاسيكي, عصري, إبداعي, عمود كامل, استمارة, شبكة), suivie du nom de style en lettres latines : « عصري · Bandeau », « شبكة · Bandeau plein ». Je retrouve mon modèle français. Mais les noms Latin dans une interface RTL restent bancals. `r3-amina-05.jpg` |
| P1-3 | Changer de modèle écrase couleur et police | **Corrigée** | Violet et Playfair gardés sur les 6 modèles : bouton Violet `aria-pressed=true`, police `playfair`, et les 6 PDF sont violets en Playfair. `r3-amina-04.jpg` |
| P1-4 | Valeurs fantômes (niveaux, date de naissance) | **Corrigée** | Dès la première frappe, l'exemple disparaît. Plus de barres de niveau, plus de date de naissance de Camille. Niveaux à « Aucun » par défaut. |
| P1-5 | Vignettes avec Camille, pas mon CV | **Toujours là** | Les vignettes de la galerie montrent « Nadia Perrin » en orange, même quand mon CV est violet et rempli. Je choisis encore à l'aveugle pour la couleur. `r3-amina-02.jpg` |
| P2-1 | Nom de fichier arabe cassé | **Corrigée** | `CV-أمينة-بن-علي.pdf`, le mot est intact. Le français : `CV-Amina-Benali.pdf`. |
| P2-2 | Dates sans contrôle | Non retestée | Je n'ai pas saisi de fin avant début. |
| P2-3 | Date coupée sur deux lignes (Moderne · Bandeau) | **Corrigée** | « Studio Lumen · Paris | mars 2021 – Présent » tient sur une ligne. `r3-amina-07.jpg` |
| P2-4 | Catalogue = liste de variantes | **Améliorée** | Les vignettes ont maintenant plus de variété visible (bandeaux, colonnes). Reste « même contenu, même logique ». |
| P2-5 | Zone de modèles trop petite | **Toujours là** | Trois vignettes de 140 px de large. Pour juger une typo, je passe à l'aperçu. |
| P2-6 | Pas de réglage fin dans l'aperçu | Toujours là | Pas de modification sur la page. |
| P2-7 | Mode Guidé affiché d'abord | Toujours là | L'éditeur s'ouvre en Guidé. Je clique Complet à chaque nouveau document. |

## Frictions nouvelles

### P0
Aucune. Tout fonctionne, 9 PDF sortis, aucune erreur console.

### P1
1. **Les vignettes ignorent mon accent et mon contenu.** Où : galerie de l'éditeur. Rien de nouveau par rapport à P1-5, mais maintenant que la couleur survit au changement de modèle, la galerie en orange devient plus gênante : la preuve que mon choix est gardé n'est pas visible avant le clic. Capture : `r3-amina-02.jpg`, `r3-amina-03.jpg`. Suggestion : teinter les vignettes avec l'accent choisi, ou un aperçu au survol avec mes données.

### P2
1. **F2 : chiffres mélangés en arabe.** Où : PDF arabe, lignes de dates. Le texte a des chiffres arabo-indiens (٢٠٢١ attendu), les dates sont en chiffres latins (« مارس 2021 - حتى الآن »). Un lecteur arabophone voit deux systèmes sur la même ligne. Capture : `r3-amina-06.jpg`. Suggestion : option « chiffres arabo-indiens » pour les dates quand le CV est en arabe, ou rien du tout, mais cohérent.
2. **Le séparateur décimal arabe « ٫ » devient un point** (« ٣.٨ » à l'écran du PDF, j'avais saisi ٣٫٨). Peu visible, mais je l'ai vu en zoomant. `r3-amina-06.jpg`.
3. **Le niveau des langues change avec le modèle.** Où : Texte, Barres, Points selon le modèle choisi : le réglage « Affichage des niveaux » est écrasé par le préréglage du modèle (alors que couleur et police tiennent). Avec mes niveaux « Aucun » ça ne se voit pas, mais c'est la même famille de friction. Suggestion : même règle que pour la couleur.
4. **Le sélecteur de police n'a pas de nom accessible.** Il n'est pas relié à l'étiquette « Police » (aucun `aria-label`). Pour un lecteur d'écran, c'est un menu muet. Les deux sélecteurs de langue en ont un.
5. **Aperçu resté sur l'exemple, une fois.** Pendant un remplissage très rapide (champs enchaînés sans pause), l'aperçu a affiché « Nadia Perrin » pendant plusieurs secondes alors que mes champs étaient remplis. Je n'ai pas pu le reproduire en deux essais plus lents. À surveiller.
6. **Beaucoup de blanc en bas des PDF.** Normal pour un CV d'une page de 6 ans, mais Moderne · Nuit devient un grand aplat violet qui n'a plus rien de « nuit ». Accent trop fort sur la colonne (le bleu marine d'origine est perdu).
7. **Le cœur du logo prend la couleur du CV** (violet, une fois choisi). C'est cute, mais l'identité de l'outil bouge avec mon document.

## Ce qui m'a plu
- Le changement de modèle ne casse plus mon travail : couleur et police tiennent. C'était ma plus grosse déception en ronde 1.
- L'exemple disparaît dès que je tape, sans rien laisser derrière.
- Arabe : RTL complet, puces propres, police nette, interface entièrement traduite, noms de fichiers corrects.
- « Mes documents » : mes deux CV portent mon nom, avec langue et date. Clair.
- Moderne · Bandeau (violet + Playfair), Chronologie · Frise et Grille · Bandeau plein sortent propres : hiérarchie nom / poste / sections lisible, filets fins, bon espacement. Photo ronde bien recadrée.
- Sobre, sans pub, « 0 requête vers un autre site » toujours rassurant.

## Jugement de la DA générale de l'interface
- **Cohérente et tenue** : fond noir, titres serrés, mono pour les étiquettes (« ÉTAPE 1 SUR 9 », « MODÈLES »), filigrane en grille. Pas une faute de goût, pas de surprise. Les contrastes et les focus sont bons.
- **Ce qui fait « froid »** : tout est gris et blanc. Le seul accent, c'est la couleur de mon CV (le cœur). Les boutons principaux sont blancs sur noir, les secondaires en contour fin. Rien ne donne envie, aucun CV coloré n'est mis en avant à l'ouverture.
- **Ce qui fait « outil de dev »** : l'éditeur reste un long formulaire à gauche, sans respiration entre sections. La galerie en vignettes de 140 px n'est pas un lieu de décision. Un graphiste attend de comparer à grande taille.
- **Mieux que la ronde 1** : le hero avec ses quatre onglets de mise en page, l'éditeur plus lisible, les noms de fichiers, la cohérence couleur/police.
- **Cohérence de l'interface arabe** : le miroir est bien fait (aperçu à gauche, formulaire à droite). Le menu de langue a un chevron qui chevauche le texte (visible dans « Mes documents » en arabe). Capture `r3-amina-05.jpg`.

## Qualité du PDF obtenu
- **Français** (Moderne · Bandeau, violet, Playfair + Source Sans) : une page A4, texte vectoriel net, photo ronde. Hiérarchie claire : nom en Playfair, poste en violet, titres de section avec filet. Puces propres, dates sur une ligne. Défaut : la moitié basse de la page est vide, ce qui est normal pour ce contenu. `r3-amina-07.jpg`.
- **Arabe** (Moderne · Bandeau) : une page, colonne à droite, titres et texte alignés à droite. Puces présentes, chiffres arabo-indiens propres, retrait régulier, aucune ligne décalée. Défaut : dates en chiffres latins (voir F2) et point décimal. `r3-amina-08.jpg`. Grille · Bandeau plein en arabe : bandeau violet avec coordonnées à gauche, nom à droite, deux colonnes de formation/compétences alignées, bien lisible.
- **Les 6 modèles en violet + Playfair** : cohérents, aucune sortie de page, aucune superposition. `r3-amina-04.jpg`.
- Nom du fichier arabe correct.

## Note globale : 8 / 10
Je le recommanderais à un ami parce que mes trois vraies frustrations (couleur et police écrasées, chiffres et puces arabes, nom de fichier) sont réglées et que l'arabe est maintenant du niveau d'un outil sérieux ; mais je ne le recommanderais pas encore à une graphiste exigeante pour le choix du modèle, tant que la galerie ne montre ni mon accent ni mes données et que l'ensemble reste aussi gris.

## Captures
- `r3-amina-01.jpg` accueil (hero, Nadia en Classique, quatre onglets)
- `r3-amina-02.jpg` éditeur Complet avec mon CV, galerie en vignettes Nadia orange
- `r3-amina-03.jpg` éditeur : Moderne · Bandeau, violet + Playfair gardés
- `r3-amina-04.jpg` les 6 PDF en violet + Playfair (planche)
- `r3-amina-05.jpg` éditeur en arabe, aperçu RTL, noms de modèles
- `r3-amina-06.jpg` PDF arabe en zoom (chiffres, puces, dates)
- `r3-amina-07.jpg` PDF français final
- `r3-amina-08.jpg` PDF arabe final (Moderne · Bandeau)
