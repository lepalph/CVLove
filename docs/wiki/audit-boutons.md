# Audit de chaque bouton

Date : 2026-11-02. Commit audité : `lepalph/CVLove@d75f031` (branche `fix/sections-niveaux-photo`).
Tests : `tests/e2e/boutons.spec.ts`, lancés sur un build figé (`OUT_DIR=.frozen/boutons`), Chromium, bureau 1440 px et mobile 390 px en français, plus un parcours en anglais et un en arabe (de droite à gauche).

## Comment lire ce document

- Chaque ligne du tableau est un contrôle (ou une famille de contrôles qui partagent le même code, par exemple les 36 boutons « Commencer avec ce modèle »).
- « Attendu » est l'effet qu'une personne en attend. « Constaté » est ce que le test a mesuré : contenu du `localStorage` (clé `cvlove:v2`), texte du PDF téléchargé, URL, élément qui a le focus, texte annoncé dans la zone `role="status"` ou `role="alert"`.
- La colonne Test renvoie à l'identifiant `[Xnn]` du nom du test dans le fichier de tests. Sauf mention contraire, le test tourne sur bureau et sur mobile.
- Un contrôle KO a un test marqué `test.fail()` avec un commentaire `// BUG:`. Quand le bug sera corrigé, ce test se mettra à échouer : il faudra alors retirer le `test.fail()` pour qu'il serve de test de non-régression.

## Résultat

- 56 scénarios, 111 exécutions (bureau + mobile + anglais + arabe). Une exécution est ignorée volontairement (E03 sur mobile : l'aperçu n'y est visible qu'après avoir changé d'onglet).
- 101 contrôles ou familles de contrôles audités : 99 OK, 2 KO.
- Les 2 KO sont décrits plus bas avec la cause probable et le correctif proposé.

## Tableau

### Accueil (`#/`)

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| Lien d'évitement | Le focus va sur `main` | `main#main` a le focus | A01 | OK |
| Logo CVLove | Retour à l'accueil (`#/`) | URL `#/`, titre H1 de l'accueil | A01 | OK |
| Lien « Mes documents » | Ouvre `#/documents`, titre de page, focus sur le H1 | URL, titre d'onglet et focus corrects | A01 | OK |
| Liens vers le code (icône, « Voir le code », « Lire le code », « Contribuer », « Code source ») | Pointent vers le dépôt | `href` égal à `GITHUB_URL` pour les cinq | A01 | OK |
| Liens « Modèles » et « Comment ça marche » (bureau) | Défilent vers l'ancre, la vue reste l'accueil | URL `#modeles` / `#comment`, section dans la fenêtre | A02 (bureau) | OK |
| Choix de la langue d'interface | Texte, attribut `lang`, `dir` (RTL en arabe) et `uiLang` mémorisé changent | Les quatre changent (fr, en, ar, retour fr) | A03 | OK |
| « Créer mon CV » (en-tête, héros, bandeau final) | Ouvre l'éditeur sur un CV vierge ; si le CV en cours est rempli, en crée un neuf sans toucher à l'ancien | URL `#/editeur`, focus sur le H1, ancien CV gardé, nouvel `activeId` | A04, A05 | OK |
| Quatre boutons de démo | Un seul pressé à la fois, l'exemple affiché change | `aria-pressed` correct, capture de la feuille différente à chaque clic | A06 | OK |
| Filtres du catalogue (catégorie, colonnes, photo, « Tous ») | La grille se réduit puis se rétablit | Nombre de modèles décroît puis revient à l'effectif de départ | A07 | OK |
| « Commencer avec ce modèle » (36 boutons) | Éditeur guidé à l'étape Identité avec ce modèle | Étape « Identité », modèle pressé dans la galerie | A08 | OK |
| « Reprendre » | Rouvre le CV rempli | Éditeur ouvert sur le bon CV | A09 | OK |

### Éditeur : en-tête, aperçu, pied de page

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| Bascule Guidé / Complet | Change de mode, mémorisé avec le document | `editorMode` écrit, mode gardé après rechargement | B01 | OK |
| Logo et lien « Mes documents » de l'en-tête | Mènent à l'accueil et à Mes documents | URL correctes | B02 | OK |
| Langue d'interface de l'éditeur | Libellés et `lang` changent, choix mémorisé | « First name » visible, `uiLang` écrit | B03 | OK |
| « Comment le vérifier » (pied) | Déplie puis replie l'explication | Texte « onglet Réseau » visible puis caché ; compteur « 0 requête » | B04 | OK |
| « Télécharger le PDF » (CV rempli) | Fichier `CV-Camille-Marchand.pdf` avec le contenu, focus gardé, annonce | Nom et texte du PDF corrects, focus sur le bouton, annonce « PDF téléchargé » | B05 | OK |
| « Télécharger le PDF » (CV vide) | Pas de PDF blanc : alerte, rien téléchargé | Alerte, aucun téléchargement, focus gardé, alerte retirée à la saisie | B06 | OK |
| Onglets Modifier / Aperçu (mobile) | Affiche le panneau voulu | Formulaire caché en Aperçu, feuille visible, `aria-pressed` correct | B07 (mobile) | OK |
| Absence des onglets (bureau) | Formulaire et aperçu côte à côte | Groupe « Affichage » caché | B07 (bureau) | OK |
| Bouton Agrandir l'aperçu (mobile) | La feuille passe à 200 % de large, puis revient | Largeur multipliée par 2 puis rétablie, `aria-pressed` correct | B07 (mobile) | OK |
| Boutons de pages « Page 2 »… | Fait défiler jusqu'à la page choisie | Le 2e canevas entre dans la fenêtre | B08 | OK |

### Menu Fichier et boîte d'import

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| « Fichier » (ouvrir) et « Exporter (JSON) » | Télécharge un JSON valide du document, referme le menu, focus sur « Fichier » | `app: cvlove`, un document, prénom présent, menu fermé, focus sur le résumé | G02 | OK |
| Touche Échap dans le menu | Referme et rend le focus | Menu fermé, focus sur « Fichier » | G02 | OK |
| « Importer (JSON) » sur un CV vide | Ajoute et ouvre directement, annonce « Fichier importé. » | Prénom importé, annonce, stockage à jour | G03 | OK |
| Boîte d'import : « Ajouter comme nouveau document » | Ajoute un second document et l'ouvre ; ce bouton a le focus à l'ouverture | Deux documents, focus initial correct | G04 | OK |
| Boîte d'import : « Remplacer » | Le document en cours prend le contenu du fichier, pas de nouveau document | Contenu remplacé, un seul document, annonce | G04 | OK |
| Boîte d'import : « Annuler » et touche Échap | Rien ne change, focus rendu à « Fichier » | Document inchangé, focus correct | G04 | OK |
| Fichier illisible ou de plus de 5 Mo | Alerte, aucun changement | Alertes « illisible » et « trop volumineux », un seul document | G05 | OK |
| Import d'un CV depuis l'éditeur de lettre | Ajouté directement (types différents), l'éditeur de CV s'ouvre | URL `#/editeur`, prénom importé | I04 | OK |
| Clic en dehors du menu ouvert | Le menu se referme | Le menu reste ouvert | G06 | KO |

### Éditeur guidé

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| Barre d'étapes (bureau) et liste des étapes (mobile) | Saute à l'étape, marque « faite » seulement si remplie, `aria-current` | Étape correcte, « Identité (faite) » seulement après saisie | C01 | OK |
| « Suivant », « Passer cette étape », « Précédent » | Change d'étape, le focus va au titre ; « Précédent » désactivé à l'étape 1 ; plus de Suivant ni Passer à la fin | Conforme | C01, C05 | OK |
| Bascule Complet puis retour en Guidé | Données et étape gardées | Prénom gardé, même étape | C02 | OK |
| Galerie de modèles de l'étape Modèle | Applique le modèle, annonce vocale, stockage, rappel « Modèle choisi » | Conforme ; le choix sur un CV vierge crée le document | C03 | OK |
| Filtres et flèches de la galerie | Catégorie réduit puis « Tous » rétablit ; une seule tabulation ; flèches déplacent le focus | Conforme | C03 | OK |
| Sections d'une étape : Masquer, Afficher, Supprimer, « + Profil » | Met à jour le CV ; un type déjà présent n'est plus proposé | Conforme | C04 | OK |
| Étapes Compétences, Autres sections, Design | Niveau, « + Projets », « + Section libre », couleur et police s'appliquent | Conforme | C06 | OK |
| Étape Télécharger : « Télécharger le PDF » | PDF `CV-Camille-Marchand.pdf` avec le contenu, annonce | Conforme | C05 | OK |
| Étape Télécharger : « Exporter (JSON) » | `cvlove.json` valide | Conforme | C05 | OK |
| Étape Télécharger : « Tout effacer » | Confirmation ; refus = rien, accord = CV vidé | Message `clearConfirm`, refus et accord corrects | C05 | OK |
| Étape Télécharger : « Créer la lettre assortie » | Crée une lettre et ouvre `#/lettre` | URL et document `letter` | C05 | OK |
| Étape Télécharger : « Voir mes documents » | Ouvre Mes documents | URL `#/documents` | C05 | OK |

### Éditeur complet : identité, photo, contacts

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| Langue du CV | Titres de section et dates changent, jamais le texte ; l'interface ne change pas de sens | « Education » en anglais, prénom gardé, `dir` reste `ltr` | D01 | OK |
| « Ajouter une photo » | Photo réduite en JPEG, enregistrée | Image `data:image/jpeg`, bouton « Photo » | D02 | OK |
| « Retirer la photo » | Photo effacée, focus rendu à « Ajouter une photo » | Conforme | D02 | OK |
| Photo illisible ou de plus de 15 Mo | Alerte, aucune photo | Deux alertes, photo vide | D02 | OK |
| Photo dans le PDF | Présente après ajout, absente après retrait | Une image, puis zéro | D03 | OK |
| « + Champ libre » et « + » d'un champ standard | Ajoute un champ de contact | Nombre de champs +1 | D04 | OK |
| Masquer / Afficher un champ | Bascule `visible` | Conforme | D04 | OK |
| Supprimer un champ (×) | Retire le champ, le focus va à un champ voisin | Champ retiré, focus sur un champ de saisie | D04 | OK |

### Éditeur complet : sections et éléments

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| « Ajouter une section » puis « + Type » | Ajoute la section, focus rendu au bouton ; un type présent n'est plus proposé | Conforme | E01 | OK |
| Monter / Descendre une section | Échange les sections ; bouton désactivé en bout de liste ; le focus passe au bouton opposé quand il se désactive | Ordre correct, focus sur « Descendre » | E02 | OK |
| Masquer / Afficher une section | Bascule `visible`, mention « (masquée) » | Conforme | E02 | OK |
| Supprimer une section (×) | Section retirée, focus sur le titre de la suivante | Conforme | E02 | OK |
| Masquer une section | L'aperçu change | Capture différente | E03 (bureau) | OK |
| « Ajouter un élément », Monter, Descendre, Supprimer (élément) | Modifie la liste d'éléments | Ordre et nombre corrects | E04 | OK |
| Titre de section | Enregistré et affiché dans le H3 | Conforme | E05 | OK |
| Dates : Mois et Année | `AAAA-MM` ; mois seul retiré = `AAAA` | `2018-03` puis `2018` | E05 | OK |
| Case « En cours » | Désactive la fin, `current` vrai | Conforme | E05 | OK |
| Niveau d'une compétence | Enregistre le niveau | Niveau 4 | E05 | OK |

### Éditeur complet : design

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| Pastilles de couleur | `accent` écrit, `aria-pressed`, annonce « Couleur … appliquée », aperçu change | Conforme | F01 | OK |
| Couleur libre | `accent` écrit | `#0e7490` | F01 | OK |
| Police | `fontPair` écrit | `playfair` | F02 | OK |
| Taille du texte et interligne | Valeurs et `aria-valuetext` à jour | 1,1 (110 %) et 1,4 (1.40) | F02 | OK |
| Marges (3 boutons) | `margins` écrit | `large`, `compact` | F03 | OK |
| Format de page (A4, Letter) | `pageSize` écrit | `LETTER`, `A4` | F03 | OK |
| Forme de la photo (3 boutons) | `photoShape` écrit | `square`, `circle` | F03 | OK |
| Affichage des niveaux (Texte, Barres, Points) | `skillDisplay` écrit ; en Texte les niveaux s'écrivent dans le PDF | Mots de niveau dans le PDF en mode Texte | F04 | OK |
| Police, couleur, format dans le PDF | Se retrouvent dans le fichier | Police `CVLoveDisplay`, couleur `#0e7490`, page 612 × 792 | F05 | OK |
| Galerie de modèles (mode complet) | Applique le modèle, annonce, aperçu change | Conforme | F06 | OK |
| Filtres photo, colonnes, catégorie (galerie) | Réduisent puis rétablissent la liste | Conforme | F06 | OK |

### Données : exemple, effacer

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| Boutons d'exemple (« Informatique »…) | Remplissent le document vide | Camille Marchand écrit | G01 et tous les tests à exemple | OK |
| « Partir d'une page vide » (bandeau d'exemple) | Confirmation ; refus = rien, accord = vide | Conforme | G01 | OK |
| « Remplir avec l'exemple » | Direct si vide ; confirmation sinon | Conforme (refus puis accord) | G01 | OK |
| « Tout effacer » (mode complet) | Confirmation ; accord = sections vides prêtes à remplir | Conforme | G01 | OK |
| « Créer la lettre assortie » (mode complet) | Crée la lettre depuis le CV | Expéditeur « Camille… » | I04 | OK |
| Stockage plein (CV) | Bandeau d'alerte avec « Exporter mes documents » | Bandeau et export `cvlove-documents.json` | I05 (cv) | OK |

### Mes documents (`#/documents`)

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| « Nouveau CV » | Ouvre l'éditeur sur un CV vierge, sans nouvelle ligne tant qu'il est vide | Conforme | H03 | OK |
| « Importer (JSON) » | Ajoute, annonce « 1 document importé. » ; fichier illisible = alerte | Conforme | H03 | OK |
| « Tout exporter (JSON) » | `cvlove-documents.json` avec tous les documents | Un document exporté | H03 | OK |
| « Ouvrir » | Ouvre l'éditeur (CV) ou la lettre | URL `#/editeur` / `#/lettre` | H01, I04 | OK |
| « Dupliquer » | Copie ouverte, annonce « … dupliqué » | Copie « Zoé 2 », annonce, deux documents | H01 | OK |
| « Renommer » (Entrée, Échap, nom vide) | Entrée valide et rend le focus ; Échap annule ; vide = « CV » | Conforme | H01 | OK |
| « Exporter » (une ligne) | `Zoé.json` avec un seul document | Conforme | H01 | OK |
| « Supprimer » | Confirmation (nom cité) ; refus = rien ; accord = ligne retirée, focus sur le H1 | Conforme | H01 | OK |
| Supprimer le dernier document | Liste vide, un brouillon vierge invisible | Liste vide, stockage vide | H02 | OK |
| « Effacer toutes mes données » | Confirmation ; accord = stockage vidé, page rechargée | Stockage sans document, pas de copie `cvlove:corrupt` | H04 | OK |
| Lien « Modifier » et langue d'interface | Mènent à l'éditeur ; titre en anglais | Conforme | H04 | OK |
| « Nouvelle lettre », CV source, « Créer la lettre », « Annuler » | Formulaire (focus sur la liste), annulation, création avec ou sans CV source | Conforme | I01 | OK |

### Lettre (`#/lettre`)

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| « Télécharger le PDF » (lettre vide) | Alerte, pas de PDF blanc | Alerte | I02 | OK |
| Boutons d'exemple de lettre | Remplissent le corps ; disparaissent ensuite | Corps rempli, groupe retiré | I02 | OK |
| Champs (objet, destinataire…) | Écrits dans le stockage | Conforme | I02 | OK |
| Mise en page (3 boutons) | `templateId` de la lettre change | Conforme | I02 | OK |
| Langue de la lettre | `lang` écrit | `en` | I02 | OK |
| « Télécharger le PDF » (lettre remplie) | `Lettre-….pdf` avec l'objet | Nom et texte corrects, annonce | I02 | OK |
| Lettre guidée : Précédent, Passer, Suivant, Télécharger, Mes documents | Comme le CV | `Lettre-Zoe-Durand.pdf`, URL correcte | I03 | OK |
| Menu Fichier de la lettre : Exporter | JSON de type `letter` | Conforme | I04 | OK |
| Stockage plein (lettre) | Bandeau d'alerte avec « Exporter mes documents » | Aucun bandeau | I05 (lettre) | KO |

### Thème, anglais, arabe

| Contrôle | Attendu | Constaté | Test | |
|---|---|---|---|---|
| Bouton de thème | Il n'y en a pas : le thème suit `prefers-color-scheme` | Aucun bouton ; fond de l'en-tête différent en mode sombre | J01 | OK |
| Parcours en anglais | Tous les libellés, titres d'onglet, annonces, noms accessibles et confirmations en anglais | Accueil, éditeur, section, modèle, PDF `CV-Zoe.pdf`, alerte de document vide, export, lettre assortie, documents, dupliquer, supprimer : conformes | K01 (bureau) | OK |
| Parcours en arabe | `dir="rtl"`, flèches de la galerie inversées, étapes, PDF, export, renommage ; pas de défilement horizontal | Conforme | L01 (bureau) | OK |

## KO : causes probables et correctifs

### KO 1. Le menu Fichier ne se referme pas quand on clique ailleurs

- **Constaté (G06, bureau et mobile).** On ouvre « Fichier », on clique dans un champ du formulaire : « Exporter (JSON) » et « Importer (JSON) » restent affichés, par-dessus le contenu. Seuls la touche Échap, un nouveau clic sur « Fichier » ou un choix dans le menu le referment.
- **Cause probable.** `src/ui/EditorParts.tsx:82` : le menu est un `<details>` natif, qui ne se referme pas tout seul au clic extérieur ni quand le focus sort. Le code ne gère que Échap (même ligne) et la fermeture après un choix (`close`, ligne 38).
- **Correctif proposé.** Dans `FileMenu`, un `useEffect` qui écoute `pointerdown` sur `document` et appelle `ref.current?.removeAttribute('open')` quand la cible est hors de `ref.current`, et `focusout` quand le focus quitte le `<details>`. Une dizaine de lignes. Garder le focus sur « Fichier » seulement pour Échap.
- **Gravité.** Faible (gêne visuelle, aucune perte de données). Plus gênant sur mobile, où le menu masque une partie du formulaire.
- **Test de non-régression.** `[G06]` dans `tests/e2e/boutons.spec.ts` : retirer `test.fail()` après le correctif.

### KO 2. Pas de bandeau « stockage plein » dans l'éditeur de lettre

- **Constaté (I05 lettre, bureau et mobile).** Quand l'écriture dans `localStorage` échoue (stockage plein, navigation privée), l'éditeur de CV et Mes documents affichent un bandeau d'alerte avec le bouton « Exporter mes documents ». L'éditeur de lettre n'affiche rien : la personne continue à écrire sa lettre sans savoir qu'elle ne sera pas gardée.
- **Cause probable.** `src/ui/LetterEditor.tsx:65-66` : le composant monte `EdHeader` puis `{dl.node}` mais pas `<SaveBanner />`, alors que `src/ui/Editor.tsx:78` l'ajoute juste après l'en-tête.
- **Correctif proposé.** Importer `SaveBanner` depuis `./bits` (ligne 12 de `LetterEditor.tsx`) et ajouter `<SaveBanner />` entre `EdHeader` et `{dl.node}`.
- **Gravité.** Moyenne : perte silencieuse de la saisie dans un cas rare.
- **Test de non-régression.** `[I05]` variante « lettre » : retirer `test.fail()` après le correctif.

## Remarques sans KO

- Les noms accessibles des boutons de Mes documents sont écrits avec une espace avant les deux-points dans toutes les langues (`Duplicate : Zoe`, `src/ui/Documents.tsx:149-153`, boutons de ligne). C'est la règle française ; en anglais on écrit `Duplicate: Zoe`. Aucun effet fonctionnel, à traiter avec les textes d'interface si on veut.
- Les liens « Modèles » et « Comment ça marche » de l'accueil n'existent pas sous 1024 px (classe `hidden lg:flex`, `src/ui/Home.tsx:57`). Sur mobile, la personne fait défiler la page. Choix de conception, non testé comme un défaut.
- Le thème suit uniquement le réglage du système : il n'y a pas de bouton pour le changer.

## Limites de l'audit

- Tests faits dans Chromium seulement ; Safari et Firefox ne sont pas couverts.
- Les liens vers GitHub sont vérifiés par leur `href`, on ne les ouvre pas.
- Les 36 modèles sont testés par échantillon (Moderne · Bandeau, Minimal · Gouttière, Classic 2) : leur bouton partage le même code.
- Les sept langues de l'interface ne sont pas toutes parcourues : français, anglais et arabe seulement. Espagnol, allemand, italien et portugais n'ont que la vérification du sélecteur de langue.
- Le test du pied de page vérifie le clic sur « Comment le vérifier », pas la touche Échap sur ce bloc.

## Historique

- 2026-11-02 : première version, sur `lepalph/CVLove@d75f031`. 2 KO trouvés (menu Fichier, bandeau de la lettre), tests marqués `test.fail()`.
