# Panel : regard TRIZ

Date : 2026-11-02. Commit testé : `lepalph/CVLove@8b5a988`, site figé sur http://localhost:4321, Chromium, bureau 1440 px et mobile 390 px (tactile), en français.

## Méthode

J'ai ouvert l'éditeur à vide, chargé les exemples « Vente et accueil » et « Informatique », parcouru les 9 étapes du mode Guidé, passé en Complet, tapé dans des champs, supprimé une section, puis regardé l'aperçu sur mobile. Ensuite j'ai cherché les contradictions : une qualité qu'on veut améliorer fait baisser une autre. Pour chacune j'ai pris un principe inventif TRIZ, au lieu de couper la poire en deux.

Mesures prises : le formulaire du mode Complet fait 9 059 px de haut avec l'exemple Informatique (soit environ 10 écrans), contre 1 page de CV. Sur mobile, la page entière fait 3 366 px à l'ouverture. Un caractère tapé met environ 460 ms à apparaître dans l'aperçu (bureau). Rien dans l'écran ne dit « gardé ».

## Les contradictions repérées

| Je veux améliorer | Mais ça dégrade | Principe TRIZ retenu |
|---|---|---|
| Voir le résultat pendant que je saisis | La place sur un écran de 390 px | 24 Intermédiaire, 2 Extraction |
| Un aperçu fidèle (le vrai PDF) | Savoir où regarder : l'aperçu ne suit pas ce que je modifie | 15 Dynamisme |
| Pouvoir tout supprimer facilement | Ne pas perdre son travail | 34 Rejeter et régénérer, 21 Passer vite |
| Tout avoir sous la main (Complet) | Ne pas se perdre dans 9 000 px de formulaire | 1 Segmentation, 7 Poupées russes |
| Zéro bruit, zéro compte | Se sentir sûr que c'est gardé | 23 Rétroaction, 25 Libre-service |

## Idée 1 : « Voir en bas » sur mobile (bascule sans quitter la saisie)

- **Problème observé.** Sur 390 px, Modifier et Aperçu sont deux écrans qui s'excluent. Quand on tape, l'aperçu n'est pas visible (mesuré : aucun canvas dans la fenêtre). Pour vérifier un changement, il faut changer d'onglet, regarder, revenir, et retrouver sa place dans le formulaire.
- **Preuve.** Captures [`1-mobile-modifier.png`](captures/triz/1-mobile-modifier.png) puis [`1-mobile-apercu.png`](captures/triz/1-mobile-apercu.png). Pas à pas : 390 px, « Vente et accueil », étape 4 Expérience, taper dans « Entreprise », bouton « Aperçu ». Le CV s'affiche à 357 px de large, texte minuscule, et le bouton « Agrandir l'aperçu » est la seule aide.
- **Idée.** Résoudre « voir » contre « saisir » par un intermédiaire (24) : une petite feuille en bas de l'écran (tiroir) qui s'ouvre sur la moitié basse, avec l'aperçu déjà défilé sur la section en cours d'édition, pendant que le formulaire reste en haut. Un geste ou un bouton « Voir » l'ouvre, et il se referme au toucher du formulaire. Les onglets Modifier et Aperçu restent pour l'aperçu en plein écran.
- **Effort.** M. Le rendu existe déjà ; il faut une zone fixe, la gestion du clavier virtuel (qui réduit la hauteur) et le défilement automatique de l'idée 2.
- **Risque.** Le clavier virtuel mange déjà la moitié de l'écran : un tiroir de plus peut laisser deux lignes de saisie. À tester sur iOS Safari. Coût de rendu sur un petit téléphone si l'aperçu se recalcule à chaque frappe (déjà un point du [REPRISE](../REPRISE.md)).

## Idée 2 : l'aperçu suit le champ en cours (et surligne la section)

- **Problème observé.** En mode Complet, on modifie « Formation » à 4 063 px dans le formulaire, mais l'aperçu reste en haut de la page 1 : on ne voit la ligne changée que par chance. Le même problème existe en Guidé quand le CV fait deux pages.
- **Preuve.** Capture [`2-bureau-edition-formation.png`](captures/triz/2-bureau-edition-formation.png). Pas à pas : 1440 px, « Informatique », Complet, champ « Diplôme » de Formation, taper « Master X ». Mesure : le panneau du formulaire défile de 0 à 4 063 px, l'aperçu reste à 0.
- **Idée.** Dynamisme (15) : quand un champ prend le focus, l'aperçu défile doucement vers la section correspondante (le titre de section est trouvé dans le texte du PDF avec pdf.js) et la section reçoit un liseré discret pendant 1 seconde. Pas de modification du PDF : le liseré est une couche posée par-dessus le canvas.
- **Effort.** M. Le texte de chaque titre est connu (`sectionSummary` et les libellés i18n), il faut le repérer dans la couche texte pdf.js et gérer le multi-page.
- **Risque.** L'arabe (titres traduits, sens inversé) et les titres personnalisés ; si le titre n'est pas trouvé, ne rien faire (pas de mauvais défilement). Les personas avaient écarté l'édition directe sur la page (« autre produit ») : ici on ne change rien dans l'aperçu, on le fait seulement suivre.

## Idée 3 : supprimer = masquer 8 secondes avec « Annuler »

- **Problème observé.** Le « × » d'une section l'efface tout de suite, sans confirmation ni retour. Après la suppression, la section suivante vient se placer sous le même bouton : un second clic au même endroit efface la suivante.
- **Preuve.** Capture [`3-bureau-suppression.png`](captures/triz/3-bureau-suppression.png). Pas à pas : 1440 px, « Informatique », Complet, « Supprimer la section Profil ». Le Profil disparaît de l'aperçu, aucune boîte de dialogue, aucun bouton d'annulation ; le « × » est maintenant celui d'Expérience, à la même place (case grisée sur la capture, survolée).
- **Idée.** Éviter la confirmation (qui ralentit tout le monde) et préférer rejeter et régénérer (34) : la suppression est faite aussitôt, une ligne « Section Profil supprimée. Annuler » reste visible 8 secondes (aussi annoncée aux lecteurs d'écran), et la touche Ctrl/Cmd+Z fait la même chose. Même chose pour la suppression d'un poste, d'une formation, d'une langue.
- **Effort.** S. Garder la dernière section supprimée et son index dans le store, et un toast. C'est déjà noté comme « Lot 2 » dans le [REPRISE](../REPRISE.md) : cette idée dit seulement que ça rapporte plus que n'importe quel autre réglage de confiance.
- **Risque.** Faible. Attention au document supprimé puis au changement de document pendant les 8 secondes : l'annulation doit viser le bon document.

## Idée 4 : en Complet, un sommaire collant et un accordéon exclusif

- **Problème observé.** Complet donne « tout, tout de suite » : 9 059 px de formulaire pour un CV d'une page, dont la section « Design » repliée en tête, puis Informations, Sections, Profil, Expérience (1 300 px à elle seule), Formation, Compétences, Langues, Projets, Centres d'intérêt. On n'a ni la progression du Guidé, ni de repère. « Tout replier » existe, mais il faut le savoir.
- **Preuve.** Capture [`4-bureau-complet.png`](captures/triz/4-bureau-complet.png) et mesure : hauteur du panneau 9 059 px, positions des titres relevées à 1722, 2399, 2569, 2903, 4191, 5465, 6415, 7366 et 8111 px. Pas à pas : 1440 px, « Informatique », « Complet », défiler.
- **Idée.** Segmentation (1) plus poupées russes (7). Une barre de pastilles collée en haut du formulaire (Identité · Profil · Expérience · Formation · …) fait défiler jusqu'à la section, qui s'ouvre ; les autres se replient sur leur résumé d'une ligne (déjà codé). Le mode Guidé devient alors la même chose avec un bouton Suivant, plutôt qu'un second écran à maintenir.
- **Effort.** M. Les résumés, le repli et la poignée existent ; il reste la barre de pastilles et la règle « une section ouverte à la fois » (avec un réglage pour ouvrir plusieurs).
- **Risque.** Moyen : l'accordéon exclusif gêne ceux qui comparent deux sections et casse le glisser-déposer entre sections hautes (le repli le facilite justement). Garder « Tout déplier » et mémoriser le choix.

## Idée 5 : un témoin « Gardé sur cet appareil » dans le pied de page

- **Problème observé.** L'enregistrement est automatique, mais rien ne le dit. Le seul témoin à l'écran est « 0 requête vers un autre site » : il prouve la confidentialité, pas la sauvegarde. L'utilisateur qui a perdu un CV une fois ne peut pas se fier à une absence de signal. Safari iOS peut purger le stockage local après 7 jours sans visite (noté dans le [REPRISE](../REPRISE.md)) et personne n'est prévenu.
- **Preuve.** Toutes les captures : le pied de page contient « 0 requête vers un autre site » et « Comment le vérifier », sans mention de sauvegarde. Pas à pas : 1440 px, taper une lettre dans Prénom, regarder l'écran entier.
- **Idée.** Rétroaction (23) à côté du témoin existant : « Gardé sur cet appareil · à l'instant », qui s'actualise à chaque écriture dans `localStorage`. Une fois par semaine, après une saisie, un rappel de 1 ligne : « Pensez à une copie : Fichier → Exporter (JSON) », puisque le navigateur peut purger. Ce que le papier ne fait pas : la preuve d'enregistrement, sans compte.
- **Effort.** S. L'écriture dans le store passe déjà par un point unique ; il faut une date de dernière écriture et une ligne dans le pied.
- **Risque.** Faible. Choisir « gardé sur cet appareil » et non « sauvegardé », qui laisserait croire à un nuage. Ne pas appeler `navigator.storage.persist()` sans geste de l'utilisateur : Firefox affiche une demande d'autorisation. Le texte doit exister dans les 7 langues.

## Classement par rapport gain / effort

1. Idée 3 (S) : un gain de confiance immédiat, un test simple.
2. Idée 5 (S) : même effort, répond directement à « mon travail est gardé ».
3. Idée 2 (M) : la plus nette pour la vitesse sur bureau, et la brique de l'idée 1.
4. Idée 1 (M) : le plus gros gain sur mobile, mais dépend de l'idée 2 et d'un test iOS.
5. Idée 4 (M) : la plus ambitieuse, qui change le mode Complet ; à valider par un essai avant.

## Ce que je n'ai pas fait

- Pas de test sur un vrai téléphone ni sous iOS : le tactile est émulé par Playwright.
- Pas de parcours chronométré d'un CV réel complet (c'est le rôle d'Edison).
- La latence de 460 ms est mesurée sur un seul essai, sur un Mac, en bureau.

## Débat (ronde 2)

- **Accord.** Engelbart 3 est mon idée 3 avec la pile d'historique en plus : je la prends (Ctrl+Z pour la structure, bandeau 8 s). Rams 4 (6 modèles puis « Voir les 36 ») et Rams 1 sont de la segmentation (principe 1), comme mon idée 4. Edison 2 (la note qui couvre le menu) : S, à faire sans discussion.
- **Désaccord 1, Rams 2.** Il garde le « × » « qui demande déjà une confirmation ». C'est faux sur ce commit : « Supprimer la section Profil » efface sans dialogue ni retour (`captures/triz/3-bureau-suppression.png`). Retirer le « × » des sections standard prive d'un geste utile ; la contradiction « effacer vite » contre « ne rien perdre » se résout par l'annulation (principe 34), pas en retirant l'un des deux boutons.
- **Désaccord 2, Rams 3.** Retirer la poignée au téléphone sacrifie le glisser livré le jour même, sans mesure d'usage. Séparation selon la condition (principe 3, qualité locale) : poignée et ↑↓ restent, mais le chevron et les ↑↓ passent dans un menu « ⋯ » à 390 px. Même gain de place, rien de perdu.
- **Désaccord 3, Engelbart 2.** Il juge que le champ allumé « ne vaut que sur bureau ». Le même index de texte sert au tiroir de mon idée 1 : sur mobile, le tiroir défile sur la ligne concernée.
- **Fusions.** (a) Mon idée 2 + Engelbart 1 + 2 : un seul index de texte pdf.js, avec le clic aperçu vers champ, le champ actif allumé et le défilement ; sa faisabilité technique chez Engelbart est meilleure que la mienne. (b) Mon idée 1 + Edison 3 : un seul tiroir mobile qui porte l'aperçu, les pastilles de couleur et le bouton Modèle. (c) Mon idée 5 + Edison 2 : un pied de page de confiance, « Gardé sur cet appareil » et l'export JSON dégagé.
- **Top 3 final, toutes pages.** 1) Annuler et rétablir avec bandeau (Engelbart 3 + mon 3 ; S à M, couvre « mon travail est gardé » face à l'erreur). 2) Aperçu et formulaire reliés (fusion a ; M, résout « fidèle » contre « où regarder »). 3) Date en une saisie (Edison 1 ; M, -36 clics mesurés sur 84, la seule idée chiffrée en temps). Le témoin « Gardé » (S) passe devant si l'on veut un gain en une demi-journée.
