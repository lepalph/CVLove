# Guidé allégé : étape Modèle courte, étape Télécharger fusionnée

Le 2026-11-11 (base `ab9ba40`), deux P2 de la [synthèse du panel](panel-synthese.md) (Rams 4 et Rams 5). Aucune question posée à l'auteur : décisions ci-dessous.

## Étape Modèle : 6 modèles, « Voir les 36 »
- Liste courte : `classique-1`, `executif-1`, `minimal-2` (Gouttière), `moderne-1`, `compact-1`, `creatif-1`. Elle couvre une colonne (4) et deux colonnes (2), avec photo (4) et sans (2), et les quatre catégories (classique, simple, moderne, créatif).
- `minimal-2` plutôt que `minimal-1` : c'est « Minimal · Gouttière », le modèle que toutes les specs existantes choisissent, donc moins de specs à réécrire.
- Le modèle déjà sélectionné s'ajoute en 7e vignette s'il n'est pas dans les 6.
- « Voir les 36 modèles » affiche le catalogue complet avec ses filtres (comportement inchangé) ; « Voir moins de modèles » revient à la liste courte. L'état est local à l'étape.
- Le panel proposait aussi « une seule rangée de catégories » sur la liste courte : non retenu, 6 vignettes sans filtre suffisent.
- `ModelGallery` (src/ui/DesignPanel.tsx) reçoit une prop optionnelle `only` (liste d'ids, sans filtres) ; sans elle, rien ne change dans le mode complet ni dans l'accueil.

## Étape Télécharger : fusionnée avec Design
- Le panel avait baissé l'idée (Rams 5 baissée par Rams lui-même : elle retire la page qui porte la lettre assortie). Décision : on fusionne quand même, mais sans rien retirer : 8 étapes, la dernière s'appelle « Design et téléchargement » et affiche les réglages, puis le récapitulatif et tous les boutons de l'ancienne étape (PDF, JSON, lettre assortie, Mes documents, Tout effacer à l'écart).
- La lettre assortie reste donc visible, ce qui lève l'objection de Rams. Le bouton « Télécharger le PDF » reste dans l'en-tête et dans la dernière étape, qui n'a pas de « Suivant ».
- Les libellés (nom d'étape, indication, « Voir les {n} modèles », « Voir moins… ») sont dans `src/i18n/guideLight.ts`, 7 langues. L'étape Télécharger de la lettre n'est pas touchée.
- Specs adaptées : `boutons` (C01, C03, C05, C06, I-lettre assortie), `cvlove` (parcours guidé) ; nouvelle spec `tests/e2e/guide-allege.spec.ts`.
