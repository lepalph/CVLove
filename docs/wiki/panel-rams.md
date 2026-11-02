# Panel : Rams (retirer jusqu'à l'essentiel)

Date : 2026-11-02. Commit testé : `lepalph/CVLove@8b5a988` (site figé, `http://localhost:4321`).
Méthode : « le moins de design possible ». Pour chaque écran de l'éditeur, j'ai compté les contrôles visibles (boutons, liens, résumés, champs) avec Playwright, au bureau (1440 px) et au téléphone (390 px), sur le CV d'exemple « Informatique ». Scripts : `scratchpad/panel-rams/a.mjs`, `b.mjs`, `c.mjs`. Je n'ai pas fait glisser une section à la main : je juge ce que je vois et compte, pas le geste.

## Ce que j'ai compté

Boutons et liens visibles (hors champs de saisie). Environ 19 contrôles sont fixes à chaque écran (lien d'évitement, logo, Mes documents, Guidé/Complet, Fichier, PDF, bandeau d'exemple, 9 étapes, Précédent, Passer, Suivant, « Comment le vérifier »).

| Écran (bureau, mode Guidé) | Boutons | Champs |
|---|---|---|
| Modèle | 70 | 1 |
| Identité | 34 | 9 |
| Profil | 29 | 3 |
| Expérience | 36 | 20 |
| Formation | 36 | 20 |
| Compétences et langues | 57 | 21 |
| Autres sections | 52 | 15 |
| Design | 41 | 5 |
| Mode Complet (tout d'un coup) | 184 | 87 |

Au téléphone : Modèle 63, Identité 27, Profil 22, Expérience 29, Compétences 50, Design 34, Complet 186 boutons et 87 champs sur une page de 9 673 px de haut (le guidé Expérience : 2 548 px). L'onglet Aperçu n'a que 8 contrôles : il est propre.

Dans le mode Complet sur téléphone, les contrôles de rangement et de suppression pèsent à eux seuls 92 boutons de 44 px : 7 poignées, 7 chevrons, 21 « Monter », 21 « Descendre », 11 « Masquer », 25 « Supprimer ».

Ce qui est en trop, redondant, rare ou confus :
- **Redondant** : une section a six boutons (poignée, chevron, ↑, ↓, Masquer, ×). Deux servent à la déplacer (poignée et ↑↓), deux à la faire disparaître (Masquer et ×). Une phrase au-dessus doit expliquer la différence (« Masquer garde la section pour plus tard sans l'imprimer. Supprimer l'efface »). Quand il faut une phrase pour expliquer deux boutons, il y en a un de trop.
- **En trop en mode Guidé** : sur l'étape Expérience, la section est seule à l'écran. Poignée, chevron et ↑↓ n'ont presque rien à faire là : l'étape est déjà le « repli ». Cela fait 5 boutons de 44 px au-dessus du premier champ.
- **Rare** : le champ « Titre de la section » (avec sa ligne d'aide) revient dans chaque section alors qu'on change presque jamais un titre. Sur Identité, 4 champs de contact ont chacun « Masquer » et « Supprimer » : 8 boutons pour 4 champs.
- **Confus** : la première étape (Modèle) montre 36 modèles et 11 boutons de filtre (catégorie, colonnes, photo) avant que la personne ait écrit son nom. Les filtres « 1 colonne / 2 colonnes » parlent à un designer. « Langue du CV » (dans Identité) et la langue de l'interface (en-tête) sont deux listes de langues différentes.
- **Doublon de sortie** : « Télécharger le PDF » est dans l'en-tête de chaque écran, et l'étape « Télécharger » le redonne, avec « Exporter (JSON) » (déjà dans « Fichier ») et « Voir mes documents » (déjà en haut). C'est la lecture de l'audit des boutons : je n'ai pas compté cette étape moi-même.

Réponse à la question posée : sur téléphone, **la poignée est de trop** (un glisser sur une page de 9 673 px, avec le doigt qui sert aussi à défiler, alors que ↑↓ marchent déjà) et **le chevron est utile seulement en mode Complet** (c'est lui qui rend la page de 9 673 px traversable). En Guidé, ni l'un ni l'autre.

Captures (`docs/wiki/captures/rams/`) : `d-modele-36.png`, `d-guide-experience.png`, `m-identite.png`, `m-complet-controles.png`, `m-competences.png`, `m-apercu.png`.

## Idées

### 1. Guidé : une section seule n'a pas besoin de barre d'outils
- **Problème observé** : en Guidé, chaque section affiche poignée, chevron, ↑, ↓, Masquer, ×, la phrase qui explique Masquer/Supprimer, et le champ « Titre de la section ».
- **Preuve** : `d-guide-experience.png` (bureau, étape 4) et `m-competences.png` ; étape Expérience au téléphone : 5 boutons de rangement avant le premier champ.
- **Idée** : en mode Guidé, ne garder par section que « Masquer » et le titre de l'étape. On enlève poignée, chevron, ↑↓, la phrase d'aide et le champ « Titre de la section » (rangé dans Complet). L'étape Compétences, qui a deux sections, garde ↑↓ seulement.
- **Ce qu'on enlève** : 5 boutons par section et une ligne d'aide, soit environ 20 contrôles sur les 8 étapes.
- **Ce que l'utilisateur perd** : replier, réordonner et renommer une section sans quitter le guidé. Il bascule sur Complet pour ça. Un « Supprimer » séparé disparaît aussi (voir idée 2).
- **Effort** : S. **Risque** : les gens qui renomment « Expérience professionnelle » en « Parcours » doivent trouver Complet ; ajouter une ligne d'aide à l'étape Design ou un lien « Réglages avancés ».

### 2. Un seul geste pour faire disparaître : Masquer
- **Problème observé** : « Masquer » et « × » coexistent pour les sections et pour les champs de contact ; une phrase les distingue.
- **Preuve** : `m-identite.png` (étape Identité, 4 contacts, 8 boutons) ; décompte au téléphone en Complet : 11 Masquer, 25 Supprimer.
- **Idée** : pour les sections standard et les contacts standard, ne garder que « Masquer » (réversible, rien n'est perdu). Le « × » reste seulement pour ce qu'on a ajouté soi-même (section libre, champ libre, éléments d'une liste) et demande déjà une confirmation. On supprime la phrase d'explication.
- **Ce qu'on fusionne** : Masquer + Supprimer en un bouton ; -1 bouton par section standard et par contact standard, soit environ -15 en Complet au téléphone.
- **Ce que l'utilisateur perd** : effacer d'un clic un contenu rempli d'une section standard (il faut vider les champs, ou « Tout effacer »).
- **Effort** : S. **Risque** : une section ou un téléphone « masqué » reste dans le JSON exporté. Qui se pense « effacé » partage encore la donnée ; ajouter la mention « masqué : toujours dans le fichier JSON » dans l'aide d'export.

### 3. Un seul moyen de déplacer une section, selon l'écran
- **Problème observé** : poignée et ↑↓ font le même travail, sur tous les écrans.
- **Preuve** : `m-complet-controles.png` (poignée, chevron, ↑, ↓ côte à côte, 44 px chacun, titre écrasé sur 2 lignes) ; 7 poignées + 14 ↑↓ de section au téléphone.
- **Idée** : au bureau, la poignée est le seul contrôle visible ; elle prend le clavier (focus puis ↑↓, comme une liste ARIA) et l'annonce vocale déjà écrite. Au téléphone, seulement ↑↓ (44 px, fiables, sans conflit avec le défilement), plus de poignée. Le chevron reste en Complet.
- **Ce qu'on enlève** : 14 boutons ↑↓ au bureau, 7 poignées au téléphone.
- **Ce que l'utilisateur perd** : au téléphone, le glisser-déposer (il vient d'être ajouté aujourd'hui) ; au bureau, le ↑↓ visible, remplacé par un geste à découvrir au clavier. Les éléments d'une liste (postes, formations) gardent leurs ↑↓ : ils n'ont pas de poignée.
- **Effort** : M (clavier sur la poignée, test à refaire). **Risque** : on retire une fonction qui vient d'être livrée ; mon avis vient d'un comptage, pas d'un test avec de vrais utilisateurs. À vérifier : combien de personnes glissent vraiment au doigt.

### 4. Étape Modèle : 6 modèles, 1 filtre, puis « Voir les 36 »
- **Problème observé** : la première chose vue est un mur de 47 contrôles de galerie (36 modèles et 11 filtres) avant d'avoir saisi une lettre.
- **Preuve** : `d-modele-36.png` (70 boutons au total ; au téléphone, 63).
- **Idée** : montrer 6 modèles choisis (un par grande famille) et une seule rangée de catégories ; « Voir les 36 » ouvre la galerie complète avec les filtres actuels. Le modèle se change de toute façon à tout moment dans Design.
- **Ce qu'on enlève** : au premier regard, 30 modèles et 6 boutons de filtre (colonnes, photo) ; 70 devient environ 30.
- **Ce que l'utilisateur perd** : le choix immédiat parmi les 36, et un clic de plus pour qui veut filtrer par photo ou colonnes.
- **Effort** : S. **Risque** : les 6 choisis deviennent « le » produit ; le choix doit rester honnête pour les 7 langues, y compris l'arabe (modèle lisible en RTL).

### 5. Supprimer l'étape « Télécharger » et ses doublons
- **Problème observé** : trois chemins mènent au PDF et au JSON : en-tête, menu Fichier, dernière étape.
- **Preuve** : `m-apercu.png` montre le bouton PDF en haut de chaque écran ; l'audit des boutons décrit l'étape 9 (PDF, JSON, Tout effacer, lettre assortie, Mes documents), dont deux sont déjà ailleurs.
- **Idée** : 8 étapes au lieu de 9. Le dernier « Suivant » devient « Télécharger le PDF » (le bouton principal). « Créer la lettre assortie » et « Tout effacer » passent dans le menu Fichier. Le lien « Voir mes documents » reste en tête de page, une seule fois.
- **Ce qu'on fusionne** : une étape et trois boutons en doublon (PDF, JSON, Mes documents).
- **Ce que l'utilisateur perd** : la page d'arrivée qui propose la lettre assortie : une fonction qui aide à rester dans le produit devient moins visible. Un message court après le téléchargement (« Votre PDF est prêt. Créer la lettre assortie ? ») peut la remplacer.
- **Effort** : M. **Risque** : le test E2E de l'étape Télécharger (C05) et les parcours des personas sont à réécrire ; ne pas toucher à l'alerte « CV vide, pas de PDF blanc ».

## Ce que je laisserais tel quel
- L'onglet Aperçu au téléphone (8 contrôles) et « Agrandir l'aperçu ».
- Les boutons de 44 px : tous les contrôles comptés les respectent.
- Le mode Guidé/Complet : deux modes se justifient (9 673 px contre 2 548 px au téléphone).

## Limites
- Chromium seulement, français seulement, CV d'exemple « Informatique » ; la taille des listes (postes, formations) fait varier les totaux.
- Je compte des contrôles, pas du temps ni des erreurs : c'est le travail d'Edison.
- L'étape Télécharger n'est pas comptée par moi (voir idée 5).

## Débat (ronde 2)

1. **Accords** : TRIZ 3 et Engelbart 3 (annuler après suppression) : sans confirmation ni phrase d'explication, ma règle « un seul geste pour disparaître » devient praticable. Edison 2 et 4 (note qui couvre Fichier, repli qui refait le PDF) : bugs, 0 contrôle de plus. TRIZ 5 (témoin « gardé ») : une ligne de texte, 0 bouton.
2. **Désaccord, TRIZ 1 (tiroir d'aperçu mobile)** : l'onglet Aperçu a 8 contrôles et c'est le plus propre de l'éditeur. Un tiroir fixe ajoute une zone, une poignée, et vole la moitié d'un écran de 390 px où le clavier mange déjà la place. Engelbart 1 + 2 (cliquer l'aperçu, champ allumé) donnent le lien entre champ et aperçu sans aucun bouton.
3. **Désaccord, Edison 3 (couleur et modèle dans l'Aperçu mobile)** : +7 pastilles et +1 bouton sur un écran à 8 contrôles, soit un doublement, pour un réglage qu'on fait une fois. Le même réglage existe déjà dans Design.
4. **Désaccord, TRIZ 4 (sommaire collant)** : +8 pastilles toujours visibles en Complet, en plus de 7 chevrons. Le guidé a déjà ce sommaire (les 9 étapes). Si on le fait, il remplace les chevrons au lieu de s'y ajouter.
5. **Désaccord, Engelbart 4 et 5** : Ctrl+K est invisible au téléphone, donc sans effet pour la moitié du public ; le bouton « Tenir sur 1 page » ajoute un contrôle et change la mise en page à la place de la personne. Seuls le compteur de lignes (texte, 0 bouton) et Ctrl+Entrée (0 bouton) passent.
6. **Fusions** : TRIZ 2 + Engelbart 2 + Engelbart 1 (l'aperçu suit le champ, le champ suit l'aperçu) ; TRIZ 3 + Engelbart 3 (un seul « Annuler », avec Ctrl+Z) ; Edison 5 + mon idée 3 (si le glisser reste au bureau, il replie tout seul) ; Edison 3 retiré au profit de mon idée 4 (peu de choix, moins de contrôles).
7. **Mon idée 5 (supprimer l'étape Télécharger)** : je la baisse. Aucun autre membre n'y touche, et elle retire la page qui porte la lettre assortie.
8. **Top 3 final** : (1) Annuler (TRIZ 3 + Engelbart 3), parce que cela supprime les confirmations et la phrase d'aide, et rend mon idée 2 sans risque ; (2) mes idées 1 + 2 (une section seule n'a qu'un bouton, Masquer), environ 35 contrôles de moins en Guidé et Complet réunis ; (3) l'aperçu et le champ qui se suivent (TRIZ 2 + Engelbart 1 + 2), la seule idée d'ajout qui ne coûte aucun contrôle visible.
