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

## Direction artistique de l'interface (skill ui-ux-director)
- Mode Opérer, niveau Mesuré. Idée : la feuille A4 au centre, l'interface s'efface autour comme un bureau calme.
- Couleur Retenue : fond « bureau » `oklch(0.965 0.004 60)`, panneau `oklch(0.99 0.002 60)`, texte `oklch(0.22 0.01 60)`, filets `oklch(0.9 0.005 60)`, **un accent corail** `oklch(0.62 0.19 22)` (sélection, focus, bouton principal). Ni noir ni blanc purs. Dark mode : pas en v1.
- Typo interface : police système, échelle rem fixe (12/14/16/19/23). Inputs ≥ 16 px sur mobile.
- Cartes à plat (bordure OU ton, pas d'ombre) ; seule la feuille A4 a une ombre douce (elle « flotte » sur le bureau). `--radius-card: 8px`.
- Motion : uniquement l'état (≤ 200 ms, ease `cubic-bezier(0.22,1,0.36,1)`), respect `prefers-reduced-motion`.
- Focus visible, cibles ≥ 44 px, libellés explicites, états vides qui disent quoi faire.
- Marque : mot-symbole « CVLove » avec un petit cœur en accent, rien de plus.

## Hors v1 (plus tard)
Scraping/import de templates sous licence libre (JSON Resume, Reactive Resume, Typst), vérification ATS locale (pdf.js + mots-clés), dark mode, plusieurs CV enregistrés.

## Livraison
Dépôt public `lepalph/CVLove`, licence MIT, README (EN + FR) qui explique le « tout local ». Déploiement Vercel par import GitHub (preset Vite, aucune config).
