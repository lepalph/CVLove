# Retour persona : Nadia (v2, mobile)

**Qui :** Nadia, 52 ans, aide-soignante en reconversion vers le secrétariat médical, peu à l'aise avec l'informatique. Android 390x844, tactile, FR.
**Parcours réalisé :** accueil, Créer mon CV, guidé de bout en bout (modèle Moderne · Bandeau avec photo, identité + photo, profil, 2 expériences, 1 formation, 3 compétences avec niveaux, langues, centres d'intérêt, couleur verte, barres), aperçu, PDF `CV-Nadia-Benali.pdf`, puis lettre assortie (4 étapes) et PDF `Lettre-Nadia-Benali.pdf`. Tout a fonctionné, aucun plantage.

## Frictions
**P0 (bloquant)**
- Étape 2 Identité (cap. 04, 09, 10) : le champ « Site web » reste pré-rempli avec `camille-marchand.exemple.fr` (données d'exemple). Je ne le vois pas dans le formulaire, il part dans mon PDF (visible dans le bandeau latéral, cap. 10). J'aurais envoyé un CV avec le site d'une inconnue. Suggestion : au premier lancement, partir de champs vides (exemple en placeholder gris), ou au minimum vider les champs non édités ; proposer « Effacer l'exemple » à l'étape 1.
- Même cause, niveaux des langues : les barres de Français/Arabe/Anglais viennent de l'exemple (5/4/3), je n'ai rien réglé. Le texte « Courant (C1) » est resté aussi. Suggestion : idem, champs vides au départ.

**P1 (gênant)**
- Étapes 2 à 7 : le guidé présente les textes de Camille (développeuse) à écraser champ par champ ; on a peur d'en oublier. Un projet de dev « Application web… » reste à supprimer à l'étape 7. Suggestion : voir P0, ou avertir « Remplacez ces exemples ».
- Mobile, en-tête (cap. 02, 04, 09) : trois rangées de commandes (Télécharger, Guidé/Complet, langue, Modifier/Aperçu) prennent ~20 % de l'écran en permanence ; l'icône « Mes documents » n'a pas de texte. Suggestion : replier Guidé/Complet et langue dans un menu, libeller l'icône.
- Aperçu mobile (cap. 09) : la feuille A4 réduite à 356 px rend le texte minuscule, je ne peux pas relire mon CV sans loupe. Aucun zoom visible. Suggestion : bouton « Agrandir » / pincer pour zoomer.
- Accueil mobile (cap. 01) : le menu (Modèles, Comment ça marche, Créer mon CV) disparaît ; seuls restent « Mes documents » et la langue. Il faut défiler pour tout trouver. Suggestion : bouton menu ou bouton « Créer mon CV » collant en haut.

**P2 (détail)**
- Étape 1 (cap. 02) : 36 modèles avec 3 filtres (type, colonnes, photo) puis une longue grille ; noms comme « Classique · Gazette » parlent peu. Je n'ai pas osé choisir sans voir mon CV dedans. Suggestion : 6 modèles recommandés en tête, nom plus parlant.
- Étape 3 (cap. 11) : lettre, la formule d'appel « Madame, Monsieur, » est un champ à l'étape 3 ; je l'ai retapée dans le corps, d'où un doublon dans le PDF (cap. 12). Suggestion : le dire dans l'aide du corps (« sans la formule d'appel, déjà ajoutée »).
- Lettre : « Lieu » vide alors que mon adresse est connue ; le titre du CV « (aide-soignante en reconversion) » est repris tel quel sous mon nom.
- Étape 6 : un seul niveau par catégorie de compétences (pas par compétence).
- « Date de naissance » affichée « Né(e) le » : je ne le mettrais pas, mais le bouton « Masquer » existe, bien.

## Avis DA
Rassurant : fond clair, gros boutons noirs (≥ 44 px), champs lisibles, étapes numérotées « Étape 1 sur 9 », focus bleu net. Le style Vercel est sobre, un peu froid pour moi ; le cœur rouge aide. Les libellés sont clairs, sans jargon (sauf « JSON » sur Exporter). Texte d'aide en gris clair parfois peu contrasté sur l'accueil (méta en mono).

## Conformité du rendu
Aperçu (cap. 09, `apercu-canvas.png`) et PDF téléchargé (cap. 10, page 1 converti avec pdfjs) : identiques, mêmes polices, couleurs, photo ronde, barres, sauts de ligne ; 1 page A4 ; texte extractible. Idem pour la lettre (cap. 11 et 12), assortie au CV (même vert, même police). Nom de fichier correct. Seul bémol : le doublon de formule d'appel et le site de Camille, qui viennent des données, pas du rendu.

## Ce qui m'a plu
Le guidé pas à pas avec « Passer cette étape », le récapitulatif avant téléchargement, le bouton « Créer la lettre assortie » et la reprise de mes coordonnées, le résultat propre en 1 page, aucune inscription.

## Note : 7,5/10

## 3 recommandations
1. Ne plus pré-remplir avec Camille (ou tout vider au démarrage du guidé) : c'est le seul vrai risque d'envoi d'un CV faux.
2. Alléger l'en-tête mobile et ajouter un zoom sur l'aperçu.
3. Réduire le choix initial de modèles (sélection recommandée) et clarifier la formule d'appel de la lettre.

Scripts : `.personas/nadia/`. Captures : `docs/retours/v2/captures/nadia/` (01, 02, 04, 07, 08, 09, 10, 11, 12).
