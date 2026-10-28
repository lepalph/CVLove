# Retour persona : Sophie (recruteuse RH, 41 ans, ordinateur 1440x900)
Je lis 50 CV par jour et j'ouvre souvent des PDF reçus d'un ATS. Je juge les 36 modèles sur lisibilité, hiérarchie, sérieux, impression, extraction du texte.

## Parcours réalisé
Accueil, éditeur guidé (étapes 1, 2, 8), catalogue de 36 modèles. Puis, avec un CV long (6 postes, 30 puces, accents, œ, €, « », 3 à 4 pages), téléchargement du PDF des **36 modèles** et extraction pdfjs de chacun. Test « stress » sur les 12 mises en page : accent très clair (#fff3b0), texte 115 %, Letter, marges larges, niveaux en barres. Aperçu comparé au PDF (page 1). Scripts : `.personas/sophie/`.

## Frictions
**P0**
- **Accent très clair = titres invisibles** (Créatif, Classique, Moderne, Minimal ; Chronologie s'en sort). Titres de section, dates, sous-titre en jaune pâle sur blanc : illisibles ; sur Créatif les dates et « Profil » ont disparu (06, 05). Suggestion : calculer l'accent du texte avec `shade()` pour garantir un contraste ≥ 4,5:1 sur blanc, ou avertir dans le sélecteur.
- **Créatif en Letter, 115 %, marges larges : 8 pages**. Le titre « Expérience professionnelle » reste seul en bas de page 1, puis chaque poste occupe une page presque vide (05). Suggestion : autoriser la coupe entre les puces d'un même poste au-delà d'une demi-page, et ne jamais laisser un titre en dernière ligne (même défaut sur Chronologie et Minimal en stress : « Expérience » ou « Langues » isolés en bas).
- **Nom déstructuré à l'extraction (ATS)** : les 3 modèles Exécutif sortent « S | O P H I E | L | E F È V R E - D U C H Â T E L » ; les titres de section sont en « P R O F I L » (Minimal Gouttière, Compact Dense/Repère/Fiche) ou « PROFI L ». Un ATS ne reconnaît ni le nom ni les rubriques (07). Suggestion : pas d'espacement par `letterSpacing` découpé en glyphes ; mettre le crénage dans la police, ou garder les capitales sans espacement.

**P1**
- **Ligature « ﬁ » (collée depuis Word/PDF) perdue** dans les modèles en Inter : « financier » devient « nancier » à l'écran et dans le PDF (Académique, Épuré, Compact, Blocs Pastel, Grille, Cadre…). Le mot disparaît pour l'ATS. Suggestion : normaliser en NFKC à la saisie/au rendu.
- **Grand blanc en bas de page** : le poste 3 est repoussé entièrement (`wrap={false}`), laissant ~20 % de page vide (Académique p.1, Moderne p.1). Suggestion : tolérer la coupe entre deux puces.
- **Barre d'étapes** (éditeur guidé) : 9 ronds numérotés sans libellé visible ; je ne sais pas ce que « 5 » veut dire sans survol (02, 09). Suggestion : libellé sous le rond actif, ou liste verticale.
- **Étapes cochées « faites » dès qu'on clique Suivant** sans rien saisir : fausse réassurance (09).
- Modèles Moderne : l'extraction commence par le contact et les compétences, le nom arrive après (colonne latérale d'abord). Lisible, mais un ATS peut prendre « Né(e) le… » pour l'en-tête. Suggestion : placer le bloc nom en premier dans l'ordre du document.

**P2**
- Curseurs de taille et d'interligne sans graduation ni bornes (09).
- Poids des PDF très variable : 24 ko (Chancellerie, Gazette) contre 550 à 800 ko (Épuré, Compact, Grille, Tableau, Créatif), polices complètes embarquées. Lent à joindre à un mail sur mobile.
- Mon CV de 3 à 4 pages est un cas extrême ; Compact Repère tient en 2 pages, bon point.

## Avis DA
Sobre, clair, rassurant : fond gris très clair, noir et blanc, rouge du cœur seul accent. Look GitHub/Vercel crédible. Aperçu large et net, boutons gros (≥ 44 px), « Télécharger le PDF » toujours visible en haut à droite. Le catalogue de 36 vignettes réelles (10) est la vraie force ; il manque une taille de vignette plus grande pour juger l'impression. Les filtres (3 rangées de segments) prennent de la place avant les modèles.

## Conformité du rendu
- Aperçu et PDF : visuellement identiques, vérifié à l'œil sur Académique, Compact Dense et d'autres. Mon score de pixels reste à 89 à 98 % (anti-aliasing), sans différence de mise en page.
- Format : 595x842 (A4) et 612x792 (Letter) corrects.
- Aucun caractère parasite (U+FFFD, zone privée) dans les 36 PDF et les 12 stress. Aucune erreur console.
- Pas d'entrée coupée entre deux pages (36/36 et 12/12) ; titres orphelins en stress seulement, plus un blanc de bas de page.
- Texte extractible dans les 36 ; ordre de lecture cohérent, sauf les défauts d'espacement (Exécutif, Gouttière, Compact) et l'ordre latéral des Moderne.

## Ce qui m'a plu
Gratuit et local, sans compte. Éditeur immédiat avec exemple. Modèles de vraie structure différente (Chancellerie, Gazette, Compact Repère très propres). PDF sans caractères parasites. Changement de modèle sans perte.

## Note : 7/10

## 3 recommandations
1. Garantir le contraste de toutes les couleurs d'accent (texte et dates) quel que soit l'accent choisi.
2. Réparer l'extraction ATS : plus de lettres espacées dans le nom et les rubriques, normalisation NFKC (« ﬁ »), nom en tête sur les modèles latéraux.
3. Corriger la pagination : jamais de titre orphelin, coupe permise entre les puces d'un poste, fin des pages vides en Letter ou 115 %.
