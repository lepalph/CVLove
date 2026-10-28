# Retour persona : Claire (v2)

**Qui je suis.** Claire, 45 ans, malvoyante. Clavier seul, zoom 200 % (fenêtre 1440x900 = 720x450 px CSS, rendu x2), lecteur d'écran par moments. Mode clair et sombre testés.
**Parcours fait au clavier** : accueil, Créer mon CV, mode guidé (modèle, identité, design, couleur, téléchargement), Aperçu, Mes documents, suppression, lettre, clair/sombre. PDF téléchargé : `CV-Camille-Marchand.pdf`. Scripts : `.personas/claire/`.

## Frictions
**P0 (bloquant pour un lecteur d'écran)**
- Aperçu (étape Aperçu) : 1 `<canvas>` sans nom, sans rôle, sans alternative. Je ne sais pas du tout ce que contient l'aperçu ni quel modèle il montre. Voir 03-apercu-200.png. Suggestion : `role="img"` + `aria-label` (« Aperçu page 1 sur N : modèle X, nom, titre… ») ou un résumé texte caché ; idem pour les 36 vignettes (le bouton a un nom, mais pas son contenu).
- Aucune annonce d'état : la zone `role=status` existe mais reste vide après choix d'un modèle, d'une couleur, ou après un téléchargement. Après « Télécharger le PDF », le focus retombe sur BODY (j'ai dû retabuler depuis le logo) et rien ne dit que le fichier est parti. Suggestion : écrire « Modèle Chancellerie appliqué », « PDF téléchargé : CV-… » dans le status ; garder le focus sur le bouton.

**P1 (gênant)**
- Zoom 200 % : l'en-tête collant (logo, boutons, bascule Guidé/Complet, langue, Modifier/Aperçu) occupe 169 px sur 450, soit 38 % de l'écran, avant même la barre d'étapes. Il reste ~200 px pour travailler. Voir 04-design-200.png. Suggestion : ne pas coller l'en-tête en hauteur faible (`@media (max-height: 600px)`), ou le replier.
- Pastilles de couleur nommées par leur code hexa (« #047857 ») : un lecteur d'écran lit un code. Suggestion : `aria-label="Vert"` (+ `aria-pressed` déjà là).
- Les 2 curseurs (taille du texte, interligne) n'ont pas de nom accessible propre (la valeur n'est que dans le texte du label, pas d'`aria-valuetext`). Suggestion : `aria-label` + `aria-valuetext="110 %"`.
- Étape 1 : il faut ~27 Tab pour atteindre la liste des modèles (barre d'étapes 9 boutons, 3 groupes de filtres) et chaque modèle est un arrêt de Tab de 323 px de haut : sur 36 modèles, c'est long. Pas de lien d'évitement (« Aller au contenu »). Suggestion : lien d'évitement, flèches pour naviguer dans la grille (radiogroupe) au lieu de 36 arrêts.
- Barre d'étapes : à 200 %, seuls les chiffres 1 à 9 sont visibles, pas les noms ; `aria-current="step"` présent uniquement sur l'étape en cours (bien), mais je ne vois pas à quoi correspond « 6 ». Suggestion : afficher le nom de l'étape courante près de la barre (déjà dans le titre plus bas, mais hors écran) ou titre au survol/focus.
- Aperçu et édition sont des onglets séparés à 200 % : je change la couleur, mais je dois quitter le formulaire pour voir l'effet. Suggestion : mini-vignette ou bouton « Voir l'aperçu » qui revient ensuite à la même place.
- Lettre : « Nouvelle lettre » ouvre un formulaire inline, mais le focus reste sur le bouton. Les 2 Tab suivants vont vers Importer/Exporter avant d'atteindre le formulaire. Voir 10-lettre-200.png. Suggestion : déplacer le focus sur le champ « CV source ».
- PDF produit non étiqueté : pas de `Language`, pas de balises (tagged = non). Le titre (`Title`) est bien rempli. Pour les destinataires qui utilisent un lecteur d'écran, le CV est difficile à lire. Suggestion : indiquer la langue du CV dans les métadonnées ; à terme, PDF balisé.

**P2 (détail)**
- Le document s'appelle simplement « CV » dans Mes documents ; plusieurs CV seraient indistinguables. Proposer « CV Camille Marchand ».
- Suppression par `confirm()` natif : accessible et lisible, mais hors charte (pas bloquant).
- Accueil : deux « Créer mon CV » consécutifs dans l'ordre de Tab (nav + hero) ; l'un des deux pourrait être sauté.

## Avis DA
Très lisible : texte noir sur blanc, gros titres, boutons de 44 px, focus bleu #0070f3 net à 2 px avec liseré, y compris sur boutons noirs (bague bleue visible sur Aperçu). Contrastes : mon test automatisé n'a trouvé aucun texte sous AA ni en clair ni en sombre (accueil, éditeur, étape Design). Le mode sombre suit mon système (11-editeur-dark.png), cœur rouge reste visible. Le style Vercel est rassurant et sobre ; la police Geist Mono en petites capitales grises (« ÉTAPE 8 SUR 9 ») est le texte le plus fin de la page. Pas de débordement horizontal à 200 % sur l'accueil (720 = 720).

## Conformité du rendu
Le PDF téléchargé est identique à l'aperçu : même modèle (Classique · Académique), même accent vert #047857 après changement au clavier, mêmes textes et mêmes retours à la ligne ; 1 page A4 (595x842 pt), texte extractible (« Camille Marchand », « Développeuse web full-stack »…). Comparaison : 08-pdf-page1.png (PDF via pdfjs) contre 06-apercu-canvas.png. Ma capture de l'aperçu est partiellement masquée par l'en-tête collant, donc le pourcentage de pixels différents mesuré (11 %) est un artefact de capture, pas une différence de rendu. Nom du fichier conforme : `CV-Camille-Marchand.pdf`.

## Ce qui m'a plu
Le parcours guidé est clair (« Étape 1 sur 9 », Précédent / Passer / Suivant) ; le focus saute sur le titre de l'étape à chaque changement ; tous les boutons ont un nom (« Supprimer : CV » est excellent) ; Échap ferme proprement ; boutons à bascule avec `aria-pressed`. Tout reste sur l'appareil.

## Note : 6,5 / 10
Très bonne base clavier et visuelle, mais l'aperçu est invisible pour un lecteur d'écran et rien n'est annoncé.

## 3 recommandations prioritaires
1. Donner un nom/une description à l'aperçu canvas et annoncer chaque changement d'état (modèle, couleur, téléchargement) dans la zone `status`.
2. Libérer de la place à 200 % : en-tête non collant sur faible hauteur, lien d'évitement, grille de modèles navigable aux flèches.
3. Nommer les pastilles de couleur et les curseurs, déplacer le focus dans le formulaire de lettre, et renseigner la langue du PDF.
