# CVLove — spec v1

Webapp gratuite et open source (esprit iLovePDF) pour faire un CV en quelques minutes.
**Tout reste chez l'utilisateur** : aucun backend, aucune requête réseau avec ses données, PDF généré dans le navigateur. Le serveur (Vercel, statique) ne sert que les fichiers.

## Stack (décidée)
- Vite + React + TypeScript, Tailwind v4 (`@tailwindcss/vite`), pnpm.
- `@react-pdf/renderer` pour produire le PDF ; `pdfjs-dist` pour l'afficher en canvas dans l'aperçu (pas d'iframe : iOS ne les affiche pas). L'aperçu EST le PDF téléchargé : identité garantie par construction.
- État : un store unique persistant en `localStorage` (zustand + `persist`, ou useReducer + effet si plus simple). Export / import JSON du CV.
- Polices auto-hébergées dans `public/fonts` (TTF, licence OFL) : une sans (Inter), une serif (Source Serif 4 ou Lora), **Noto Sans Arabic** pour l'arabe. Désactiver la césure react-pdf.
- Pas de routeur : deux vues (galerie, éditeur) via l'état + hash.
- Tests : Vitest. Script `pnpm check:pdf` (Node) qui rend chaque template × chaque langue en PDF, vérifie avec pdfjs que le texte est extractible et que les libellés de la langue sont présents, et exporte un PNG de la page 1 dans `out/` pour revue visuelle.

## Fonctionnel
- **Galerie** : choisir un template (vignettes = vrai rendu avec données d'exemple, dans la langue du CV).
- **Éditeur** : formulaire à gauche, aperçu PDF live à droite (debounce ~300 ms, double tampon pour éviter le clignotement). Mobile : onglets « Modifier / Aperçu ». Bouton « Télécharger le PDF » (nom de fichier `CV-Prenom-Nom.pdf`). Changer de template sans perdre les données.
- **Infos personnelles** : prénom, nom, titre, date de naissance, lieu, e-mail, téléphone, site, photo (optionnelle, gardée en data URL locale). Champs présents par défaut mais chacun masquable/supprimable ; ajout de champs libres (libellé + valeur).
- **Sections** : profil, expérience, formation, compétences, langues, projets, centres d'intérêt, section libre. Ajouter, supprimer, masquer, réordonner (boutons monter/descendre, pas de lib de drag & drop), renommer (titre personnalisé). Items réordonnables aussi.
- **Dates** : mois/année + case « en cours » ; formatées avec `Intl` dans la langue du CV.
- **Langue du CV** (FR, EN, ES, DE, IT, PT, AR) : change les libellés (« Formation » → « Education ») et le format des dates, **jamais le contenu saisi** ; un titre renommé à la main reste tel quel. AR = mise en page miroir (RTL) dans chaque template.
- **Langue de l'interface** : mêmes 7 langues, détectée via `navigator.language`, sélecteur séparé. `dir="rtl"` sur l'interface en arabe.
- Données d'exemple pour démarrer + bouton « Tout effacer » (avec confirmation).

## Templates v1 (4, dessinés par nous)
1. **Classique** : une colonne, serif pour les titres, sobre.
2. **Moderne** : deux colonnes, bandeau latéral teinté (photo, contact, compétences).
3. **Minimal** : une colonne, beaucoup de blanc, sans-serif, hiérarchie par la graisse.
4. **Créatif** : en-tête affirmé avec couleur d'accent, mise en page asymétrique.
Chaque template : couleur d'accent réglable (5 propositions), A4, gère texte long, page 2, sections vides masquées, avec/sans photo, LTR/RTL.
Architecture : `src/templates/<id>.tsx` + un registre ; un template ne reçoit que le CV et le dictionnaire de libellés. Ajouter un template = un fichier + une ligne.

## Direction artistique (v1.1, remplace « papier et encre »)
Brief utilisateur : vibe Vercel / GitHub, tech et communautaire, mais accessible au plus grand nombre.
- Accueil = mode Persuader niveau Mesuré ; éditeur = mode Opérer.
- Jetons (fiche Vercel du skill ui-ux-director) : fond `#fafafa`, surfaces `#ffffff`, panneau `#f2f2f2`, encre `#171717`, corps `#4d4d4d`, atténué `#8f8f8f`, filet 1 px `#ebebeb`, lien/focus `#0070f3`, erreur `#ee0000`. Dark mode via `prefers-color-scheme` (fond `#0a0a0a`, surface `#111`, encre `#ededed`, filet `#262626`) ; la feuille A4 reste blanche.
- Police : **Geist** (UI et texte) + **Geist Mono** pour les petits labels techniques uniquement, auto-hébergées (OFL). Graisses 400 / 500 / 600. Titre hero 48 px (32 mobile) `letter-spacing -0.05em`, sections 32 px.
- Rayons : 6 px contrôles, 12 px cartes, pilule pour les CTA marketing. Filet avant ombre ; seule la feuille A4 a une ombre légère.
- Marque : mot-symbole « CVLove » + petit cœur rouge, seule couleur de marque. Pas de dégradé maillé.
- Accessible : clair par défaut, cibles ≥ 44 px, contraste AA, aucun jargon, focus visible, `prefers-reduced-motion`.
- Motion : uniquement l'état (< 200 ms, `cubic-bezier(0.22,1,0.36,1)`).

## Parcours (v1.1)
1. **Accueil** (`#/`) : présente le concept, boutons rapides vers l'éditeur.
2. **Éditeur** (`#/editeur`) : on arrive directement sur un modèle par défaut (Classique) avec les données d'exemple ou les données déjà enregistrées. Plus d'étape galerie obligatoire.
3. Dans l'éditeur, **sélecteur de modèle visuel** bien visible au-dessus de l'aperçu : rangée de vignettes (vrais rendus miniatures), un clic change la mise en page, les données restent. Remplace le `<select>` « Modèle ».
4. Depuis l'accueil, « Commencer avec ce modèle » ouvre l'éditeur avec ce modèle.

## Accueil : structure et textes (FR, à traduire dans les 7 langues de l'interface)
- **Nav** (sticky, filet bas) : CVLove ♥ · Modèles · Comment ça marche · Code source (icône GitHub) · [Créer mon CV] (bouton noir) · sélecteur de langue d'interface.
- **Hero**, deux colonnes (texte à gauche, démo à droite ; empilé en mobile) :
  - Titre : « Votre CV en PDF, sans compte et sans frais. »
  - Sous-titre : « Remplissez vos informations une fois, essayez les modèles, puis téléchargez le PDF. Tout se passe sur votre appareil. »
  - CTA : « Créer mon CV » (pilule noire) · « Voir le code sur GitHub » (pilule blanche à filet).
  - Méta (Geist Mono, petit) : « Gratuit et open source · 7 langues · Sans inscription »
  - **Démo (moment signature)** : vrai rendu PDF de l'exemple + 4 boutons de modèles au-dessus ; un clic change la mise en page. Légende : « Mêmes informations, quatre mises en page. »
- **Comment ça marche** (`#comment`), liste numérotée sur filets, pas de cartes :
  1. « Remplissez. Nom, expériences, formation : chaque champ peut être masqué, renommé ou déplacé. »
  2. « Changez de modèle quand vous voulez. Vos informations sont conservées, seule la mise en page change. »
  3. « Téléchargez. Le PDF est fabriqué dans votre navigateur et prêt à envoyer. »
- **Modèles** (`#modeles`) : « Quatre modèles pour commencer » ; grille de 4 vignettes réelles, chacune avec son nom et un bouton « Commencer avec ce modèle ».
- **Vie privée** : titre « Vos données restent chez vous ». Texte : « Vous n'avez pas de compte à créer et aucun serveur ne stocke votre CV : il est enregistré dans votre navigateur, qui fabrique aussi le PDF. Le code est public, n'importe qui peut le vérifier. Pour passer sur un autre appareil, exportez votre CV dans un fichier puis réimportez-le. » Lien « Lire le code » vers GitHub.
- **Langues** : titre « Un CV en français aujourd'hui, en anglais demain ». Texte : « Changez la langue du CV : les titres de sections et les dates s'adaptent, votre texte reste tel quel. » Illustration typographique : le mot « Formation » dans les 7 langues (Formation · Education · Formación · Ausbildung · Formazione · Formação · التعليم), en vrai texte.
- **Projet ouvert** : titre « Un projet ouvert ». Texte : « Le code est sous licence MIT. Vous pouvez proposer un modèle, corriger une traduction ou signaler un problème sur GitHub. » CTA « Contribuer sur GitHub ».
- **Bandeau final** : « Il ne vous manque plus que vos informations. » + « Créer mon CV ».
- **Footer** : CVLove · Licence MIT · Code source · Aucun cookie.
Lien GitHub : https://github.com/lepalph/CVLove

## Hors v1 (plus tard)
Scraping/import de templates sous licence libre (JSON Resume, Reactive Resume, Typst), vérification ATS locale (pdf.js + mots-clés), dark mode, plusieurs CV enregistrés.

## Livraison
Dépôt public `lepalph/CVLove`, licence MIT, README (EN + FR) qui explique le « tout local ». Déploiement Vercel par import GitHub (preset Vite, aucune config).

---

# v2 — parité de parcours et de catalogue avec Mon CV Parfait, sans IA, sans compte, sans paywall
Argument : tout est gratuit pour de vrai, téléchargement libre, aucun abonnement, rien ne quitte l'appareil. La DA v1.1 (Vercel/Geist) est conservée.

## Modèle de données v2
- **Documents multiples** : `documents: { id, kind: 'cv' | 'letter', name, updatedAt, data }[]` + document actif, en localStorage, avec **migration automatique** du stockage v1 (le CV existant devient le premier document, rien n'est perdu ; test unitaire obligatoire).
- **Design par document** : `design = { templateId, accent (hex libre), fontPair, fontScale (0.9 à 1.15), lineHeight (1.2 à 1.6), margins ('compact' | 'normal' | 'large'), pageSize ('A4' | 'LETTER'), photoShape ('circle' | 'rounded' | 'square'), skillDisplay ('text' | 'bars' | 'dots') }`. Choisir un modèle applique ses valeurs par défaut ; l'utilisateur peut ensuite tout surcharger ; changer de modèle garde le contenu.
- **Niveaux** optionnels (1 à 5) sur les compétences et les langues, affichés selon `skillDisplay`.

## Catalogue : 12 mises en page × 3 styles = 36 modèles
- Une **mise en page** = un composant react-pdf (`src/templates/layouts/<layout>.tsx`). Un **style** = un preset de design (police, en-tête, forme de photo, affichage des niveaux, accent par défaut) + une variante passée au composant.
- Le registre est construit automatiquement (`import.meta.glob`) : ajouter une mise en page = un fichier, sans toucher au registre.
- Métadonnées par modèle : nom, catégorie (`classique` | `moderne` | `creatif` | `simple`), colonnes (1 | 2), photo (oui | non). La galerie filtre là-dessus.
- Les 4 actuelles deviennent les mises en page 1 à 4. Mises en page 5 à 12 à créer, toutes **différentes de structure** (pas seulement de couleur), inspirées des familles courantes de CV, sans copier aucun modèle existant.
- **Paires de polices** (OFL, TTF statiques, générées par scripts/make-fonts.py) : 6 paires lisibles et sérieuses. L'arabe utilise toujours Tajawal.
- Chaque modèle : A4 et Letter, 7 langues, RTL, texte long sur 2 pages, avec et sans photo, texte extractible (ATS). `check:pdf` couvre les 36 modèles.

## Éditeur : deux modes interchangeables
- **Guidé** : barre d'étapes cliquable (Modèle, Identité, Profil, Expérience, Formation, Compétences et langues, Autres sections, Design, Télécharger), boutons Précédent, Suivant, Passer cette étape. On peut sauter n'importe quelle étape.
- **Complet** : le formulaire unique actuel.
- Bascule entre les deux à tout moment, sans perte, choix mémorisé. Le mode guidé est le défaut pour un nouveau document.
- **Panneau Design** (dans les deux modes) : vignettes de modèles avec filtres, couleur libre (pastilles + sélecteur), police, taille, interligne, marges, format de page, forme de photo, affichage des niveaux.

## Mes documents (`#/documents`)
Liste des CV et lettres : créer, ouvrir, dupliquer, renommer, supprimer (avec confirmation), exporter et importer en JSON. Accessible depuis l'en-tête.

## Lettre de motivation
Document `kind: 'letter'` : expéditeur (repris d'un CV choisi, modifiable), destinataire, lieu et date, objet, formule d'appel, corps, formule de politesse, signature. Assortie au CV : reprend son accent, ses polices et son style d'en-tête par défaut. 3 mises en page de lettre. PDF local, mêmes contrôles (langues, RTL, texte extractible).

## Hors v2
Aides à la rédaction (base de phrases par métier), export Word, import de PDF, vérification ATS.
