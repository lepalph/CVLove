# Panel : Engelbart (manipulation directe et augmentation)

Date : 2026-11-02. Commit testé : `lepalph/CVLove@8b5a988`, site figé sur `http://localhost:4321`, Playwright à 1440 px et 390 px.

## Ce que j'ai constaté

- L'aperçu est un `<canvas>` par page (`PdfCanvas`). Cliquer dessus ne fait rien : le focus reste sur `<main>` (test à 1440 px et par tap à 390 px).
- Le formulaire est long : 55 champs en mode complet ; sur 390 px il fait 8 914 px de haut et « Cashier » se trouve à 3 523 px. Sur mobile, formulaire et aperçu sont deux onglets : corriger une faute vue dans l'aperçu veut dire changer d'onglet, défiler, retrouver le champ.
- Sur le bureau, les deux colonnes défilent séparément : quand on écrit en bas du formulaire, le poste concerné est ailleurs dans l'aperçu (capture 02).
- Retour immédiat : la frappe produit une nouvelle page en environ 0,5 s (mesure : 511 ms entre la dernière touche et le canvas remplacé ; 300 ms viennent du debounce). C'est assez bon ; on ne voit pas quelle ligne vient de changer.
- Aucun raccourci clavier dans `src/` (recherche faite). Aucun « annuler » : le × d'une expérience la supprime sans confirmation et sans retour possible (test : 45 champs avant, 41 après un seul clic).
- Sur 390 px le texte de l'aperçu fait environ 6 px à l'écran ; le bouton « Agrandir l'aperçu » existe mais on ne peut pas viser une ligne (capture 03).
- Le PDF extrait bien son texte : `getTextContent()` de pdf.js rend des lignes propres avec leur position (x, y, largeur). Sur l'exemple « Vente et accueil », 36 morceaux de texte sur 57 se retrouvent tels quels dans les données du CV ; les 21 autres sont des titres de section, des dates mises en forme, des niveaux ou des « : », qu'on rattache à l'élément voisin sur la même ligne.

Captures : `captures/engelbart/01-bureau-complet.png`, `02-apres-frappe.png`, `03-mobile-apercu.png`, `04-mobile-formulaire.png`.

## Garde-fou

`docs/retours/v3/SYNTHESE.md` a écarté l'« édition directe sur la page, formes, pictos et fonds façon Canva ». Je n'y reviens pas : ici l'aperçu ne s'édite pas, il sert de **carte** pour aller au bon champ, et le texte reste saisi dans le formulaire. Le PDF et ses modèles ne changent pas.

## Idées

### 1. Cliquer une ligne de l'aperçu pour aller à son champ
- **Problème** : voir une faute dans l'aperçu et devoir chercher le champ, surtout sur mobile (8 914 px de formulaire).
- **Preuve** : étapes ci-dessus ; clic et tap sur le canvas sans effet ; « Cashier » à 3 523 px de haut.
- **Idée** : un clic (ou un tap) sur une ligne de l'aperçu ouvre la section si elle est repliée, fait défiler le formulaire jusqu'au champ (titre, lieu, puce, date…) et y met le focus ; sur mobile, bascule aussi sur l'onglet Modifier. Au survol (bureau), le curseur devient une main et la ligne est encadrée. Un titre de section mène à son champ « Titre de la section », une date au mois de début, un niveau à la liste de niveau. Si le même texte existe deux fois (« Bristol City College »), on prend le n-ième dans l'ordre du document.
- **Effort** : M.
- **Risque** : mauvaise cible quand deux champs ont le même texte (on tombe au moins dans la bonne section) ; sur les modèles en 2 colonnes l'ordre de lecture diffère, à vérifier modèle par modèle. Doit rester discret : ne pas donner l'impression qu'on peut taper dans l'aperçu.
- **Faisabilité technique** : `PdfCanvas.tsx` appelle déjà `page.getViewport` ; ajouter `page.getTextContent()` pour chaque page et remonter une liste `{str, x, y, w, h, page}` par un nouveau rappel `onText` (comme `onState`). Le clic est lu sur le conteneur (`host`), converti en points PDF avec `largeur CSS / base.width`. Un module pur `src/ui/previewMap.ts` (testable, comme `sectionDrag.ts`) associe le texte aux champs du CV après NFKC (même normalisation que `render.tsx`). Le formulaire a besoin d'ancres : un `data-field="<sectionId>.<itemId>.<champ>"` sur les `<input>` de `Form.tsx` et `Guided.tsx`, et le changement d'onglet vient de l'état `tab` de `Editor.tsx`. `PreviewPane` (`EditorParts.tsx`) porte l'overlay de survol. Aucun changement dans `render.tsx` ni dans les modèles.

### 2. Le champ actif s'allume dans l'aperçu
- **Problème** : on écrit en bas du formulaire sans voir la ligne concernée ; après la frappe, on ne sait pas ce qui a bougé.
- **Preuve** : capture 02 (focus sur « Languages », l'aperçu montre le haut du CV) ; aucun repère de ce type dans l'interface.
- **Idée** : quand un champ prend le focus, la ligne correspondante de l'aperçu reçoit un cadre léger et l'aperçu défile pour la montrer (sans voler le défilement si elle est déjà visible). Après chaque nouveau rendu, la ligne modifiée clignote une fois (0,6 s, pas du tout avec `prefers-reduced-motion`). C'est l'idée 1 dans l'autre sens, avec le même index.
- **Effort** : S (si l'idée 1 est faite), sinon M.
- **Risque** : défilement automatique mal venu pendant la frappe ; ne défiler qu'à l'arrivée du focus, jamais à chaque touche. Sur mobile l'aperçu n'est pas visible en même temps : l'idée ne vaut que sur le bureau.
- **Faisabilité technique** : même liste de morceaux de texte que l'idée 1 ; on cherche le texte de l'élément actif (`focusin` sur le panneau du formulaire dans `Editor.tsx`) et on dessine un `<div>` absolu dans `PreviewPane` (le conteneur `relative` existe déjà, ligne `ref={sheet}`). Le défilement réutilise `scrollIntoView` comme `goPage`. Le clignotement compare l'ancienne et la nouvelle liste de textes à l'appel de `onState('ready')` dans `PdfCanvas.tsx`. Pas de couche de texte pdf.js visible, donc rien à gérer pour l'accessibilité ou la sélection.

### 3. Annuler et rétablir (Ctrl/Cmd+Z), plus un bandeau « Supprimé, annuler »
- **Problème** : supprimer une expérience, une section ou « Vider » est irréversible ; la promesse « mon travail est gardé » s'arrête à la sauvegarde, pas à l'erreur de geste.
- **Preuve** : clic sur × d'une expérience : 45 champs, puis 41, immédiatement, sans confirmation ni retour. Aucun « undo » dans `src/` (seules des phrases « cette action est irréversible »).
- **Idée** : une pile d'historique par document (30 états, regroupée par pause de frappe de 800 ms), Ctrl/Cmd+Z et Ctrl/Cmd+Maj+Z, deux boutons dans le menu Fichier, et après une suppression un bandeau de 8 s « Expérience supprimée. Annuler ». Le papier ne le fait pas, un éditeur le doit.
- **Effort** : M.
- **Risque** : Ctrl+Z natif dans un champ de texte doit rester celui du champ (le navigateur annule la frappe) ; l'historique du document ne prend la main que hors champ ou pour les actions de structure. Mémoire : photo en data URL dans chaque état, donc ne pas dupliquer la photo (garder la même chaîne par référence, ce qui est le cas avec des mises à jour immuables).
- **Faisabilité technique** : toutes les modifications passent par `update((c) => …)` dans `src/store.ts` (fonctions de `src/model/cv.ts`) : on y ajoute `past`/`future` hors persistance (non écrits dans localStorage, donc le format de stockage ne change pas) et deux actions `undo`/`redo`. Le bandeau se branche sur `removeThenFocus` de `Form.tsx`. L'aperçu se met à jour tout seul, car `PdfCanvas` se relance quand `deps` change. Tests unitaires dans le style de `cv.test.ts`.

### 4. Palette « Aller à… » (Ctrl/Cmd+K) et raccourcis de saisie
- **Problème** : il n'y a aucun raccourci ; pour remplir un vrai CV on passe sans cesse de la souris au clavier (ajouter une entrée, la monter, changer de section).
- **Preuve** : recherche des écouteurs `keydown` : seulement l'échap du menu Fichier et le saut de page. Formulaire de 55 champs au bureau.
- **Idée** : Ctrl/Cmd+K ouvre une liste filtrable : « Expérience », « Compétences », « Modèle », « Couleur », « Télécharger », « Aperçu / Modifier », « Annuler ». Entrée y va (ouvre la section, focus). Dans une liste d'entrées : Ctrl/Cmd+Entrée ajoute une entrée et met le focus dans son premier champ, Alt+↑/↓ la déplace. `?` affiche l'aide des raccourcis. Tout reste accessible aux boutons existants.
- **Effort** : M (la palette) ; S pour les deux raccourcis de saisie seuls.
- **Risque** : conflits avec les raccourcis du navigateur et des lecteurs d'écran (éviter Ctrl+S, Ctrl+P) ; sur Mac et Windows la touche change (détecter `metaKey`/`ctrlKey`). 7 langues dont l'arabe : les libellés des commandes viennent des textes déjà traduits (sections, modèles, couleurs), peu de textes nouveaux. Pas de valeur sur mobile, donc ne rien afficher là-bas.
- **Faisabilité technique** : un seul `keydown` global dans `Editor.tsx`. Les cibles sont celles de l'idée 1 (`data-field`) et de `Form.tsx` (`data-add` existe déjà pour « ajouter une entrée »). Les listes de sections viennent de `cvLabels`, les modèles de `getTemplate`/registre `src/templates`, la couleur de `ACCENTS`. Rien dans `src/pdf/`.

### 5. Compteur « il manque 3 lignes pour tenir sur 1 page » et bouton « Tenir sur N pages »
- **Problème** : le grand public se bat avec la longueur du CV (une page ou deux) sans outil ; la seule aide est la barre « 2 pages ». Le papier ne mesure pas, l'outil le peut.
- **Preuve** : le PDF « Vente et accueil » laisse beaucoup de place en bas de page ; l'aperçu multipage (`docs/wiki/apercu-multipage.md`) ne dit que le nombre de pages, pas de combien on dépasse.
- **Idée** : sous la barre de pages, une phrase : « Page 2 : 3 lignes de trop pour tenir sur 1 page » ou « Il reste de la place pour environ 12 lignes ». Un bouton « Essayer de tenir sur 1 page » applique des marges compactes puis une taille de texte un peu plus petite (jamais en dessous de 0,9, la limite du modèle), montre le résultat et se défait d'un clic (idée 3).
- **Effort** : M.
- **Risque** : promettre une page qu'un autre lecteur PDF ne donnera pas ; on le fait donc avec le même moteur que le téléchargement (c'est le cas, l'aperçu est le vrai PDF). Ne pas réduire la lisibilité sans le dire. Chaque essai coûte un rendu complet (environ 0,3 à 0,5 s) : trois essais au plus, hors thread de frappe.
- **Faisabilité technique** : le nombre de lignes de trop se calcule avec les mêmes morceaux de texte que l'idée 1 (dernière ligne de la dernière page contre hauteur utile de la page 1 ; pas de nouvelle donnée). L'essai de mise en page appelle `renderPdf` de `src/pdf/render.tsx` avec un `design` modifié (`margins: 'compact'`, `fontScale` dans 0,9 à 1,15, déjà dans `Design`) et lit `numPages` ; le bouton s'ajoute dans `PreviewPane` (`EditorParts.tsx`) et applique le résultat via `update` du store. Aucun changement des modèles.

## Ce que je ne propose pas
- Glisser les sections dans l'aperçu : c'est déjà possible dans le formulaire (`sectionDrag.ts`) ; le refaire dans le canvas ajouterait un second geste pour le même résultat et rapprocherait l'outil de l'édition « façon Canva » écartée.
- Une couche de texte pdf.js visible : plus lourde (mémoire, accessibilité en double du formulaire) pour un gain que l'idée 1 donne déjà.

## Ordre conseillé
3 (confiance, sans risque pour l'aperçu), puis 1 et 2 ensemble (même index de texte), puis 5, puis 4.

## Débat (ronde 2)

- **Accords.** TRIZ 3 (annuler 8 s) est mon idée 3 : je lui laisse le « S » pour le bandeau seul, le Ctrl+Z général reste M. TRIZ 5 (« Gardé sur cet appareil ») complète l'annulation : même promesse de confiance, effort S. Edison 2 (la note couvre le menu Fichier, 6,25 s perdus) et Edison 4 (replier ne doit pas refaire le PDF) sont des corrections sans risque : à faire d'abord.
- **Accord sur Edison 1** (date en une saisie) : 48 clics sur 84 pour 6 éléments est la mesure la plus nette du panel. J'ajoute : afficher la date comprise (« mars 2021 ») sous le champ.
- **Désaccord avec Rams 2** (garder seulement « Masquer »). Une section « masquée » reste dans le JSON exporté : la personne croit avoir effacé et partage encore la donnée. Avec l'annulation (mon idée 3), « × » devient réversible et sûr : on n'a plus besoin de le retirer, on peut même discuter de retirer « Masquer » à la place pour les contacts.
- **Désaccord avec Rams 3 sur mobile** (retirer la poignée) : je n'ai pas de mesure d'usage non plus ; je laisserais la poignée tant qu'on ne sait pas si on glisse au doigt. Je suis d'accord avec Rams 1 en Guidé (une section seule n'a pas besoin de barre d'outils).
- **Désaccord avec TRIZ 1** (tiroir d'aperçu en bas sur mobile) : le clavier virtuel prend déjà la moitié de l'écran et le texte de l'aperçu fait 6 px. Je préfère Edison 3 (pastilles de couleur et modèle dans l'onglet Aperçu) plus mon idée 1 (toucher une ligne mène au champ).
- **Désaccord avec TRIZ 4** (accordéon exclusif) : il gêne la comparaison de sections. Les pastilles de saut sont bonnes, la règle « une seule ouverte » non ; mon idée 1 donne déjà un autre accès rapide.
- **Fusions.** TRIZ 2 + mon 1 + mon 2 = un seul index « texte du PDF vers champ », construit une fois dans `PdfCanvas` ; je renonce à ma version « bureau seulement » si TRIZ 2 teste le défilement automatique en arabe. Mon 3 + TRIZ 3 + TRIZ 5 = un « bandeau d'état » (supprimé, annuler, gardé). Mon 5 (tenir sur 1 page) reprend la mesure d'Edison (rendu 0,3 à 0,5 s) pour limiter les essais à trois.
- **Top 3 final, toutes pages.** (1) Annuler + bandeau « supprimé, annuler » (mon 3 + TRIZ 3, avec « Gardé » en bonus). (2) Aperçu cliquable dans les deux sens (mon 1 + mon 2 + TRIZ 2). (3) Date en une saisie (Edison 1), pour le gain mesuré de 36 clics.
