# Synthèse v3 (nuit du 28 au 29 octobre 2026)

## Ronde 1 : Léa 6,5 · Marc 7 · Amina 6,5 · Julien 7

Constat commun : l'outil marche et le PDF est propre, mais le démarrage paraît froid. L'exemple et les placeholders sont ceux d'une développeuse senior, l'éditeur s'ouvre sur 36 miniatures, la lettre démarre vide, et rien ne guide celui qui n'a « rien à écrire ».

### Lot 1A : éditeur (Editor, EditorParts, Guided, PdfCanvas, Home, index.css)
- P0 la page entière défile en Guidé desktop et finit sur un écran vide (Marc). Idem `#/lettre`.
- Démarrer à l'étape Identité quand le modèle vient de l'accueil ; étape Modèle : carte « Modèle choisi » (Léa, Marc).
- Conseils courts par étape pour un premier CV (Léa).
- « Suivant » en bouton principal ; défilement en haut de l'étape à chaque changement (Léa).
- Confirmation visible après téléchargement (Léa).
- Aperçu : séparation visible entre les pages et nombre de pages (Marc).

### Lot 1B : contenus et données (i18n, model, store, DesignPanel, LetterEditor, Documents, lib)
- Placeholders neutres, non calqués sur Camille, avec suggestions pour Catégorie de compétences (Léa).
- Exemple sans date de naissance (Julien).
- Lettre : « Remplir avec l'exemple » et aperçu d'exemple tant qu'elle est vide, aide du corps (Marc).
- Première lettre nommée « Lettre 2 » (Marc).
- Changer de modèle garde la couleur et la police choisies à la main (Amina).
- Nom de fichier arabe cassé, noms de modèles génériques en arabe (Amina).

### Lot 1C : rendu PDF (templates, pdf)
- Moderne·Bandeau : la colonne latérale sort avant le nom dans le texte extrait (Julien).
- Exécutif·Doublé : nom découpé `C|AMILLE` par les petites capitales (Julien).
- Blocs·Pavé : une section seule passe en page 2 alors qu'il reste de la place (Julien).
- Arabe : chiffres arabo-indiens en gras déformés, puces manquantes, ligne décalée (Amina).
- Une date se coupe sur deux lignes dans un PDF français (Amina).

### Écarté pour ne pas dénaturer l'outil
- Édition directe sur la page, formes, pictos et fonds façon Canva (Amina) : autre produit.
- Champs recruteur supplémentaires (poste visé, mobilité) : les champs personnalisés existent ; à revoir si une autre ronde le redemande.

## Ronde 2 : Léa 7,5 (6,5 en r1) · Inès 7 · Tom 7,5 · Gérard 7

Le lot 1 a porté : Léa voit 6 de ses frictions corrigées. Ce qui reste : l'exemple unique de développeuse (cité par 4 personas sur 8), les champs de date natifs (anglais, tronqués, inutilisables au clavier), la lettre peu guidée, et des points d'accessibilité.

### Lot 2A : coque, accessibilité, accueil, Mes documents
- Titre de page par route, focus posé sur le contenu à chaque changement de page, `h1` dans l'éditeur (Inès).
- Bascule Modifier/Aperçu : bouton à deux états (`aria-pressed`) au lieu d'onglets incomplets (Inès).
- Accueil : « Reprendre mon CV » quand un CV existe, avec la mention qu'il reste sur l'appareil (Gérard). Débordement en tablette portrait (Gérard).
- Mes documents : focus rendu après Renommer, annonce après Dupliquer, l'import ne laisse plus un CV vide actif, dates au format du navigateur, pluriels (Inès, Tom).
- Rouge « Supprimer » à 4,34:1, à foncer (Inès).

### Lot 2B : formulaires et contenus
- Dates : listes Mois et Année localisées au lieu de `type=month` (Léa, Gérard, Inès).
- Trois profils d'exemple : vente et accueil, premier emploi, informatique (Léa, Marc, Gérard, Amina).
- Champs personnalisés nommés « Nom du champ » et « Valeur » ; deux « Niveau » des langues distingués ; boutons de section nommés avec leur section (Tom, Léa, Inès).
- Lettre : trame d'exemple dans le champ Corps, exemple visible aussi après « Créer la lettre assortie » (Léa, Marc).
- Anglais de l'interface : guillemets anglais, pas d'espace avant les deux-points (Tom).

### Lot 2C : PDF
- Espace avant les deux-points seulement en français (Tom).
- Liens cliquables (e-mail, site, champs personnalisés en URL) ; Blocs 2 sur une page si possible.

### Écarté
- Aperçu toujours visible sur mobile (Léa) : l'écran est trop étroit, l'onglet Aperçu reste le bon compromis.
- Format Letter basculé automatiquement selon la langue (Tom) : choix de l'utilisateur, on ne le change pas dans son dos.

## Ronde 3 : Marc 8 (7 en r1) · Amina 8 (6,5 en r1) · Gérard 8 (7 en r2) · Sami (contributeur) 8

Les reprises montrent que les lots 1 et 2 ont porté : défilement, dates, exemple, couleur gardée, arabe, reprise du CV. Sami a ajouté un 13e modèle en suivant CONTRIBUTING sans toucher au registre ; la doc a été complétée d'après son retour.

### Lot 3 (dernier)
- Vignettes de la galerie dans la couleur et la police de l'utilisateur (Amina).
- Un CV déjà rempli rouvre le guidé à Identité, pas à Modèle (Gérard).
- Lettre : trois exemples au choix, comme pour le CV (Marc).
- Un poste ne se coupe plus entre deux pages (Marc).
- « Exporter (JSON) » explicite dans Mes documents, nom accessible du choix de police, étapes en 13 px (Gérard, Amina).

### Arrêt des itérations
Les notes plafonnent à 8 et les frictions restantes touchent au positionnement (aperçu riche façon Canva, réglages fins dans l'aperçu, bouton « Permis » dédié). Continuer reviendrait à changer de produit.
