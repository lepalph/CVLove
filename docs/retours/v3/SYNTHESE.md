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
