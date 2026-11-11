# Wiki CVLove

Mémoire du chantier « éditeur fiable et maniable » (lancé le 2026-11-02 par le chief of staff). Historique daté : chaque affirmation sur le code cite son commit (`lepalph/CVLove@<sha>`). Les sources (PR, rapports d'agents) sont citées, jamais recopiées.

## Environnement
- [Builds parallèles](environnement-builds-paralleles.md) — `OUT_DIR` + `E2E_PORT` : un build et un port par agent.
- [Règles des agents](regles-agents.md) — modèles, fichiers disjoints, commits, langues.
- [Mentions légales](mentions-legales.md) — 2026-11-11 : page `#/mentions` en 7 langues, liste des `[À REMPLACER]`.
- [Autopilote du 11 novembre](autopilote-2026-11-11.md) — 2026-11-11 : plan de nuit en vagues, agents, ce qui est écarté.

## Vérifications
- [Vérification de la reprise](verification-reprise.md) — 2026-11-02 : 7 affirmations fausses ou dépassées, e2e 50/51 à cause de serve-dist (corrigé).
- [Audit des boutons](audit-boutons.md) — 2026-11-02 : 101 contrôles, 2 KO corrigés (menu Fichier, bandeau de la lettre).

## Fonctions
- [Glisser-déposer et repli des sections](sections-glisser-replier.md) — 2026-11-02 : poignée pointer events, moveSectionTo, repli gardé par document, limites.
- [Aperçu multipage](apercu-multipage.md) — 2026-11-02 : plafond 30 pages annoncé, page courante, précédente/suivante, défilement gardé.
- [Performance de l'aperçu](performance-apercu.md) — 2026-11-11 : PDF de l'aperçu dans un Web Worker ; à CPU ×4, tâches longues pendant la frappe 2 s → 0, frappes > 100 ms 6/20 → 0/20.
- [Aperçu relié au formulaire](apercu-relie.md) — 2026-11-11 : un clic sur une ligne de l'aperçu met le focus sur son champ ; texte de pdf.js rapproché du CV, PDF inchangé.
- [Colonne latérale sur la bonne page](colonne-laterale-pages.md) — 2026-11-11 : `moderne` dessinait sa colonne sur la dernière page d’un CV long ; cause react-pdf, correctif, règle « page 1 » de `check:pdf`.
- [Nouvelles sections](nouvelles-sections.md) — 2026-11-11 : bénévolat, certifications, publications ; 7 langues, `apart`, `SideEntry`, nettoyage, règle « ordre » étendue.

- [Lettre et accessibilité](lettre-accessibilite.md) — 2026-11-11 : lettre vierge suit la langue, alerte vide retraduite, échec PDF une seule fois, « exemple » annoncé ; allemand 401 px déjà réglé.

## P0 du panel (2026-11-02)
- [Annuler une suppression](annuler-suppression.md) — bandeau 8 s et Ctrl/Cmd+Z ; depuis le 2026-11-02, ne rétablit que l'élément supprimé.
- [Audit UX de l'éditeur](audit-ux-editeur.md) — 2026-11-02 : sections épurées (chevron › à droite, actions en bas), témoin dans le pied, ordre des dates ; Nielsen 26 → 31/40.
- [Date en une saisie](date-une-saisie.md) — un champ MM/AAAA à la place des listes, `parseMonthInput`, revient sur un choix de la ronde 2 v3.
- [Corrections S](corrections-s.md) — note PDF non bloquante, repli sans rendu PDF, témoin « Enregistré sur cet appareil ».
- [Bilan du 2026-11-02](bilan-2026-11-02.md) — résultats de la suite complète et suites à donner.

## Panel d'inventeurs
- [Brief du panel](panel-brief.md) — question, contraintes et méthode des 4 inventeurs.
- [Synthèse du panel](panel-synthese.md) — 2026-11-02 : P0 annuler, date en une saisie, 3 corrections S ; P1 aperçu relié au formulaire.
- [Panel P1](panel-p1.md) — 2026-11-11 : sections repliées pendant le glisser, guidé allégé, sommaire collant du mode complet.
- Pages : [TRIZ](panel-triz.md), [Edison](panel-edison.md) (mesures), [Engelbart](panel-engelbart.md), [Rams](panel-rams.md) ; captures dans `captures/`.
- [Stockage et liste des documents](stockage-documents.md) — 2026-11-11 : exemple marqué, storage.persist(), tri, état vide, libellés.
- [Langues, dir="auto" et photo](langues-photo.md) — 2026-11-11 : niveaux CECRL pour les langues, migration, sens de saisie, avertissement photo.
- [Tenir sur 1 page](tenir-une-page.md) — 2026-11-11 : option Design `fitPage` (marges, interligne, texte à 0,9) pour les 36 modèles, visible dès qu'un CV déborde.
- [Guidé allégé](guide-allege.md) — 2026-11-11 : étape Modèle à 6 vignettes + « Voir les 36 », étapes Design et Télécharger fusionnées.
- [Réglages dans l'aperçu mobile](reglages-apercu-mobile.md) — 2026-11-11 : tiroir « Réglages » (modèle, couleur, police, taille, 1 page) sous l'aperçu, sous 1024 px.
- [Poids et chargement](poids-chargement.md) — 2026-11-11 : mesures avant/après, hero pré-rendu en WebP au build, polices en sous-ensembles, vignettes de l'éditeur après l'aperçu, React.lazy.
