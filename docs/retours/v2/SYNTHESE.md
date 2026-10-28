# Synthèse des retours v2 (2026-10-28)

Sources : 6 personas (nadia 7,5 · karim 7,5 · sophie 7 · youssef 5 · tom 7,5 · claire 6,5) + audit-securite.md + audit-solution.md.
Acquis : aperçu = PDF téléchargé (écart < 5 % de pixels, anti-crénelage), aucune requête hors localhost, 36 vignettes réelles appréciées, DA jugée sobre et rassurante.

## Lot A : parcours, contenu, mobile, accessibilité, signature (src/ui, src/i18n)
- P0 Nouveau CV vide (placeholders), l'exemple Camille/Laila ne sert qu'aux vignettes et démos ; bouton « Charger l'exemple » optionnel ; « Tout effacer » accessible dans les deux modes. Données existantes conservées. (nadia, karim, tom, youssef)
- P0 Aperçu accessible : role="img" + aria-label résumé ; zone role=status qui annonce modèle appliqué, couleur, PDF téléchargé ; focus conservé après téléchargement. (claire)
- P1 En-tête mobile et faible hauteur sur une ligne, non collant si hauteur < 600 px ; panneau Design replié en mode complet mobile ; zoom sur l'aperçu. (nadia, karim, youssef, claire)
- P1 Barre d'étapes nommée, étape « faite » seulement si remplie ; « Masquer » et « × » explicites ; champ Fin désactivé si « En cours ». (sophie, karim, revue)
- P1 Documents nommés par le nom complet, message après import, état vide pour un nouveau CV ; lettre : lieu repris du CV, formule d'appel non dupliquée, focus sur le formulaire. (tom, nadia, claire)
- P1 A11y : lien d'évitement, grille de modèles en radiogroupe (flèches), noms de couleurs, curseurs avec aria-valuetext, bordures de champs ≥ 3:1, import JSON accessible au clavier. (claire, audit-solution)
- P1 Arabe : pas de letter-spacing ni de police mono sur l'arabe dans l'interface. (youssef)
- Signature DA : compteur « 0 requête vers un autre site » mesuré en direct, cœur du logo à la couleur d'accent du document, trame au ratio A4, barre d'étapes « 01 Modèle » en mono.

## Lot B : moteur PDF et modèles (src/templates, src/pdf)
- P0 Contraste de l'accent garanti dans les 12 mises en page (helper commun). (sophie)
- P0 Pagination : titre de section jamais seul en bas de page, Créatif à 8 pages, blancs excessifs. (sophie, tom)
- P0 Extraction ATS : pas de letter-spacing qui éclate les mots (Exécutif, Minimal, Compact), normalisation NFKC (ligature ﬁ), apostrophe ’ qui coupe les mots (cause racine). (sophie, lettre)
- P0 Police arabe de repli dans tous les modèles quelle que soit la langue du CV ; paragraphes arabe + latin qui se mélangent au retour à la ligne. (youssef)
- P1 Lettre arabe : destinataire et date à droite ; noms de styles traduits ; métadonnée Language du PDF ; détails Chronologie, Moderne « Contact », Pavé en arabe. (youssef, claire, karim)

## Lot C : robustesse et sécurité (src/model, src/store.ts, vercel.json, scripts)
- M1 vercel.json avec en-têtes (CSP testée), M2 photo limitée aux data:image base64, M3 nettoyage à l'import et à l'hydratation. (audit-securite)
- Quota localStorage dépassé : avertir, ne rien perdre ; error boundary ; supprimer la clé v1 après migration ; sauvegarde débouncée. (audit-solution)
- check:pdf échoue si registre vide, ids uniques, meta.id = nom de fichier ; limites de taille import et photo, PNG transparent sur fond blanc.

## Lot D : documentation et contribution (après A, B, C)
README FR + EN à jour v2 avec captures et GIF du parcours, CONTRIBUTING (ajouter un modèle, critères d'acceptation : original, lisible ATS, 7 langues, check:pdf), modèles d'issue et de PR, CI GitHub Actions (build, test, check:pdf, e2e), contrat de types.ts en anglais.
