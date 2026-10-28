# Ronde 1, persona Léa

## Qui
Léa, 19 ans, étudiante en BTS. Premier CV pour un job d'été en restauration. iPhone (390x844, tactile, fr-FR). Un baby-sitting et un bénévolat à mettre. Elle veut un CV « joli » vite. Test sur http://localhost:4301, Chromium headless émulant un iPhone (pas de vrai Safari iOS).

## Parcours réalisé
Accueil, défilement jusqu'au catalogue, choix d'un modèle (d'abord Créatif · Aplat, puis Créatif · Pastel pour le PDF), éditeur guidé : Identité, Profil, Expérience (2 entrées), Formation, Compétences et langues, Autres sections (passée), Design (regardé), Télécharger. Aperçu consulté à vide et rempli. PDF téléchargé (`CV-Lea-Martin.pdf`) et relu.

## Première impression (les 30 premières secondes)
Accueil : titre clair, « sans compte et sans frais » me rassure, un gros bouton noir « Créer mon CV ». Le CV de démo est celui de Camille Marchand, développeuse full-stack, 6 ans d'expérience. Je ne me reconnais pas du tout (capture 01). Le catalogue est facile à parcourir avec les aperçus (capture 02).

Dans l'éditeur, je tombe sur l'étape « Modèle » : une longue grille de 36 miniatures, pas de CV à moi, pas d'aperçu visible (il faut taper « Aperçu » en haut, capture 03). Je ne comprends pas tout de suite que le CV existe dans l'autre onglet. Quand je tape « Aperçu » sans avoir rien rempli, je vois le CV de Camille avec la phrase « Exemple. Vos informations le remplacent dès que vous commencez à écrire. » (capture 04). Cette phrase rassure. Mais le contenu (« +18 % de conversion », « TypeScript ») me fait sentir que mon CV sera nul à côté.

Ressenti : propre, sérieux, un peu froid. Plus outil de dev que « joli CV pour mon premier job ».

## Frictions

### P0
Aucun blocage : j'arrive au PDF.

### P1
1. **Placeholders hors sujet pour un premier CV.** Où : tous les champs (Profil, Poste, Entreprise, Diplôme, Compétences, ajout d'un 2e élément : « Développeuse front-end / Studio Pivoine »). Ce qui se passe : les exemples sont ceux d'une dev senior (« Développeuse full-stack avec 6 ans d'expérience… », « Master Informatique », « React, TypeScript »). Je ne sais pas ce qu'on attend de moi et je me sens en dessous. Capture 05 (Profil), 06 (2e expérience). Suggestion : exemples adaptés au profil ou plusieurs exemples tournants (baby-sitting, job d'été, étudiant), et au moins un exemple « premier emploi » dans les aides.
2. **Aucune aide pour celle qui n'a rien à écrire.** Où : Profil et Expérience. Ce qui se passe : « Deux ou trois phrases pour dire qui vous êtes et ce que vous cherchez » est correct, mais je ne sais pas par quoi commencer. Rien ne dit que baby-sitting, bénévolat ou stage comptent comme expérience. Suggestion : un court conseil sous chaque titre d'étape (« Pas d'emploi ? Mettez un baby-sitting, un bénévolat, un job d'été »), et une phrase de profil modèle à adapter.
3. **L'éditeur démarre sur la grille de 36 modèles, sans CV visible.** Où : étape 1, mobile. Ce qui se passe : j'avais déjà choisi un modèle sur l'accueil. On me redemande de choisir, sans me dire que mon choix est conservé (il l'est, mais rien ne le dit clairement). Capture 03. Suggestion : commencer à l'étape Identité quand le modèle vient de l'accueil, ou afficher « Modèle choisi : Pastel » avec le CV en vignette.

### P2
1. **Aperçu seulement dans un onglet.** Où : mobile. Je tape un champ, je ne vois pas le résultat. Je dois basculer sur « Aperçu » à chaque fois. Suggestion : mini-aperçu ou bouton flottant « Voir mon CV ».
2. **Le défilement n'est pas remis en haut au changement d'étape.** Où : passage Identité vers suivante. À l'arrivée, l'en-tête de l'étape est parfois coupé sous la barre. Suggestion : scroll au titre de l'étape.
3. **Le bouton « Suivant » est gris foncé, presque désactivé, à côté de « Passer cette étape » qui est plus lisible.** Capture 05. Je ne sais pas si je peux avancer.
4. **Dates : champs « mois » natifs.** Où : Début/Fin. En Chromium, affichage « September 202… » en anglais et tronqué, alors que la locale est fr-FR (limite possible du navigateur de test ; sur iPhone le sélecteur natif sera sans doute mieux). Le placeholder « AAAA-MM » n'apparaît pas pour de vrai. Capture 06.
5. **Compétences : « Catégorie » et « Niveau (Aucun…Expert) ».** Je ne sais pas quoi mettre en catégorie. Pour Langues, je mets « Anglais » sans niveau et le PDF affiche juste « Anglais ». Suggestion : suggestions de catégories (Savoir-être, Outils, Langues).
6. **Téléchargement sans retour visible.** Où : étape 9. Après avoir tapé « Télécharger le PDF », le bouton devient gris, aucun message (« PDF enregistré »). Capture 08. Sur iPhone, je ne saurais pas où est le fichier.
7. **Les boutons « Masquer » et « × » sur chaque section** m'inquiètent (la phrase « Supprimer l'efface » est lue, mais « × » est ambigu).
8. **Catalogue d'accueil : la miniature « Classique · Chancellerie » est restée en squelette gris** au moment de ma capture (chargement différé). Vu une fois, non reproduit (pas de capture conservée).

## Ce qui m'a plu
- Pas de compte, pas de pub, mention « 0 requête vers un autre site » toujours visible, ça rassure.
- « Seul le nom est utile, le reste est facultatif » sur l'étape Identité.
- Les couleurs d'accent changent tout de suite le ton du CV (le cœur du logo aussi) : c'est joli.
- Le récapitulatif de l'étape 9 est clair.
- L'étape Autres sections propose Projets et Centres d'intérêt (utiles pour remplir).
- Le PDF est propre et lisible.

## Qualité du PDF obtenu
`CV-Lea-Martin.pdf`, 1 page A4, modèle Créatif · Pastel, accent violet. Typographie claire (titre en Playfair, texte lisible), mise en page nette, bandeau pastel agréable. Mes accents (Léa, « Lycée Livet ») sont corrects. Mais seulement 55 % de la page est utilisée : le CV a l'air maigre, avec un grand blanc en bas. Pas de rappel du niveau d'anglais. Page vue : capture 07 (aperçu), le PDF correspond à l'aperçu.

## Note globale : 6,5/10
Je le recommanderais à un ami parce que c'est gratuit, sans inscription et que le PDF est propre, mais l'éditeur est pensé pour quelqu'un qui a déjà un CV : pour un premier CV, il manque des exemples et des conseils adaptés, et le premier écran est un mur de miniatures sans mon CV.

## Captures
01 accueil, 02 catalogue, 03 éditeur au démarrage, 04 aperçu vide (exemple de Camille), 05 étape Profil, 06 ajout d'une 2e expérience, 07 aperçu rempli, 08 après téléchargement.
