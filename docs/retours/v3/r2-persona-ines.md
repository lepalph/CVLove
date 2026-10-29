# Ronde 2 : Inès (clavier seul, basse vision, VoiceOver, zoom 200 %)

## Qui
Inès, 34 ans, comptable, basse vision. Clavier seul, lecteur d'écran, zoom 200 % (simulé par un viewport 720×450). Interface en français, build http://localhost:4302. Limites : Chromium headless, pas de VoiceOver réel. Les noms accessibles viennent de `ariaSnapshot()`, les annonces de la lecture des nœuds `role=status`. Pas d'axe-core : tout est vérifié à la main.

## Parcours réalisé
Accueil (Tab jusqu'à « Créer mon CV », 6 arrêts), éditeur guidé, choix d'un modèle (flèches + Espace), étapes Identité, Profil, Expérience, « Passer cette étape », Design (couleur Bleu, curseur), retour au modèle (Minimal · Épuré), Télécharger (PDF obtenu : CV-Ines-Benali.pdf), Mes documents (dupliquer, renommer, supprimer). Contrôles en plus : onglets Modifier/Aperçu, titres de page, débordement à 200 % et à 320 px, contrastes, `prefers-reduced-motion`.

## Première impression (les 30 premières secondes)
Le lien d'évitement apparaît au premier Tab, avec un cadre bleu net. Le titre « Votre CV en PDF » est très lisible à 200 %, rien ne déborde, le contraste est fort (texte le plus pâle : 8,1:1). Rassurant. Ensuite je perds ma place : après Entrée sur « Créer mon CV » la page change mais le focus tombe sur le `body`, et mon prochain Tab m'envoie en bas de page, sur « Passer cette étape ». Je ne sais plus où je suis.

## Frictions

### P0 (bloquant ou échec AA franc)
Aucun blocage total : tout le parcours se fait au clavier. Les deux points suivants sont à traiter en premier.

### P1
1. **Titre de page identique partout** (`<title>` = « CVLove » sur `#/`, `#/editeur`, `#/documents`, `#/lettre`). Le lecteur d'écran n'annonce pas le changement de page. WCAG 2.4.2 Titre de page (A). Suggestion : `document.title = "Mes documents · CVLove"` à chaque route.
2. **Focus perdu au changement de page** (accueil vers éditeur, éditeur vers Mes documents) : `document.activeElement` = `body`, le prochain Tab part d'un point arbitraire. Capture : r2-ines-01.jpg (avant). WCAG 2.4.3 Ordre du focus (A), 3.2.2 en esprit. Suggestion : après chaque navigation, mettre le focus sur le `h1`/`main` (`tabindex=-1`), comme l'app le fait déjà entre les étapes (le `h2` reçoit le focus, c'est bien).
3. **Renommer un document : le focus disparaît** à la validation (Entrée) et à l'annulation (Échap) : retour sur `body`. Aucun message annoncé. Capture : r2-ines-08.jpg (page). WCAG 2.4.3 (A) et 4.1.3 Messages d'état (AA). Suggestion : rendre le focus au bouton « Renommer : … » et annoncer « Document renommé » dans un `role=status`.
4. **Dupliquer est silencieux** : un document apparaît, le focus reste sur « Dupliquer », aucune annonce (`role=status` vide). Un utilisateur VoiceOver ne sait pas que ça a marché. WCAG 4.1.3 (AA). Suggestion : « Copie créée : Inès Benali 2 ».
5. **Aperçu / Modifier : motif onglet incomplet.** Les deux boutons ont `role=tab` mais la flèche droite ne change pas d'onglet, il n'y a aucun `role=tabpanel` (0 trouvé) et pas de lien `aria-controls`. Le lecteur d'écran promet un comportement qui n'existe pas. WCAG 4.1.2 Nom, rôle, valeur (A) et 2.1.1 Clavier (A) pour les flèches attendues. Suggestion : soit les flèches + tabpanel, soit de simples boutons `aria-pressed`.
6. **Champs de date « Début » / « Fin » (`type=month`)** : trois arrêts de Tab par champ (mois, année, calendrier), `placeholder="AAAA-MM"` ignoré par Chromium, et la valeur reste vide tant que mois et année ne sont pas tous deux saisis, sans message. Mon test de saisie au clavier (« 092018 », flèches) n'a jamais rempli le champ en headless, donc le PDF n'a pas montré les dates (uniquement « Présent »). À confirmer à la main avec VoiceOver et Safari (qui n'affiche pas ce contrôle comme Chrome). WCAG 3.3.2 Étiquettes ou instructions (A), 2.1.1 (A). Suggestion : deux champs texte « Mois » / « Année », ou un texte libre « 09/2018 » avec format indiqué.
7. **Boutons répétés sans contexte dans l'éditeur** : « Monter », « Descendre », « Masquer », « Supprimer » (×) reviennent dans chaque section et chaque entrée avec exactement le même nom. Dans Mes documents, le nom contient le document (« Supprimer : CV sans titre »), pas ici. Au lecteur d'écran en liste de boutons, on ne sait pas laquelle des sections est visée. WCAG 2.4.6 En-têtes et étiquettes (AA), 4.1.2 (A). Suggestion : `aria-label="Supprimer : Expérience professionnelle"`.

### P2
8. **Texte rouge « Supprimer »** : contraste 4,34:1 pour du texte de 15 px (seuil 4,5:1). Capture : r2-ines-08.jpg. WCAG 1.4.3 Contraste minimum (AA). Suggestion : assombrir un peu le rouge. Aucun autre texte sous 4,5:1 (gris, aide, placeholder 5,3:1, « Étape x sur 9 » 8,4:1).
9. **Pas de `h1` dans l'éditeur** (0 trouvé), alors que l'accueil, Mes documents et la lettre en ont un. L'étape est un `h2`, puis un second `h2` « Informations personnelles » au même niveau. WCAG 1.3.1 Information et relations (A, technique G130) et 2.4.6 (AA). Suggestion : `h1` « Éditeur de CV » (même masqué), étape en `h2`, sous-blocs en `h3`.
10. **Aperçu = `<canvas>` sans nom accessible** (`aria-label` absent). Le lecteur d'écran ne dit rien du rendu. WCAG 1.1.1 Contenu non textuel (A). Suggestion : `role="img"` + `aria-label="Aperçu du CV"` (le contenu est déjà dans les champs).
11. **Débordement à 320 px (400 % de zoom)** : défilement horizontal de +47 px (accueil, sélecteur de langue), +28 px (éditeur, bouton « Télécharger le PDF »), +9 px (documents). À 200 % (720 px), aucun débordement, aucun texte coupé : OK pour moi. WCAG 1.4.10 Reflow (AA) ne vaut que pour 400 %.
12. **Beaucoup d'arrêts de Tab à l'étape Modèle** : 31 Tab pour atteindre la grille, 33 pour « Suivant ». La grille est bien en tabindex itinérant (un seul arrêt, flèches OK), ce qui sauve la situation. Le bandeau étapes + filtres reste long. WCAG 2.4.1 Contourner des blocs (A) est couvert par le lien d'évitement, mais seulement vers `main` ; pas de lien « aller à Suivant ». Suggestion : étapes dans un seul arrêt (flèches) ou bouton « Suivant » proche du haut.
13. **Étape courante** : le stepper pose `aria-current="step"` (bien), les étapes faites se nomment « Modèle (faite) » (bien). Rien à corriger ; noté pour mémoire.
14. **Lien d'évitement** : c'est un `<button>`, pas un lien, et il recouvre le logo « CVLove » quand il apparaît (r2-ines-01.jpg). Il fonctionne (focus sur `main`). WCAG 2.4.1 (A) respecté. Détail de forme seulement.

## Vérifications sans problème
- **Focus visible** à chaque arrêt (33 arrêts mesurés dans l'éditeur, plus l'accueil et Mes documents) : contour plein de 2 px bleu `rgb(0,112,243)`, contraste 4,36 à 4,55:1 face au fond (seuil 3:1). Jamais caché par un en-tête (l'en-tête n'est pas collant). WCAG 2.4.7 (AA) et 2.4.11 (AA) respectés. Sur les boutons « pressés » (fond sombre) le contour passe en gris clair, visible.
- **Pièges à focus** : aucun. Pas de modale personnalisée ; la suppression utilise un `confirm()` natif, accessible au clavier.
- **Noms des champs** : tous les champs ont un `label` visible repris dans le nom (2.5.3 OK). Aide « Laissez vide pour le titre standard » incluse dans le nom du champ. Le sélecteur de langue est nommé.
- **Annonces** : « Modèle Moderne · Bandeau appliqué », « Couleur Bleu appliquée », « PDF téléchargé : CV-Ines-Benali.pdf » passent par `role=status`. Au changement d'étape, le `h2` reçoit le focus : annonce naturelle du titre. Très bien.
- **Titres** : accueil `h1` > `h2` > `h3` cohérents. Mes documents `h1` OK.
- **Curseurs** (Taille du texte, Interligne) : flèches OK, valeur lue (« 105 % »).
- **Langue** : `<html lang="fr">`, `dir=ltr`.
- **prefers-reduced-motion** : avec « reduce », 0 animation en cours et `scroll-behavior: auto` ; sans préférence, 10 animations `pulse` (squelettes de chargement). Respecté. WCAG 2.3.3 (AAA) ; hors périmètre AA mais bien.

## Ce qui m'a plu
- Le contour de focus épais et constant, sur tout le site.
- Le focus qui va sur le titre de l'étape quand je fais « Suivant ».
- La grille de 36 modèles qui ne demande qu'un seul Tab, avec les flèches.
- Les annonces de couleur, de modèle et de téléchargement.
- Les contrastes très forts et un affichage à 200 % sans coupure.

## Qualité du PDF obtenu
Modèle Minimal · Épuré, couleur bleue. Nom, titre, e-mail, profil et poste lisibles, net, mise en page propre (capture vue, page 1). Le poste « Comptable · Cabinet Durand » n'a pas de dates car mon champ « Début » n'a pas pris la saisie (voir P1-6) ; la puce de description et « En cours » étaient bien saisies. Le texte du PDF est vectoriel et sélectionnable, 1 page. Le PDF reste très vide quand on remplit peu, normal. Non vérifié : balisage du PDF (PDF/UA), ordre de lecture.

## Captures
r2-ines-01 (lien d'évitement au premier Tab), 02 (grille de modèles, focus sur le modèle choisi), 03 (filtres et grille à 200 %), 04 (aperçu de l'étape Expérience), 06 (aperçu), 08 (Mes documents, focus sur Supprimer en rouge).

## Note globale : 7/10
Je le recommanderais à un ami malvoyant parce que le contraste, le focus visible et la grille de modèles au clavier sont soignés, et que tout le parcours se fait sans souris, mais il faut corriger le titre de page, le focus perdu aux changements de page et le motif onglet pour que ce soit confortable avec VoiceOver.
