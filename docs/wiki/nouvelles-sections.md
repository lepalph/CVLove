# Nouvelles sections : bénévolat, certifications, publications

Écrit le 2026-11-11, base `lepalph/CVLove@8f4a55c`. Demande : [REPRISE.md](../REPRISE.md), lot 2, « Sections manquantes ». Agent de la nuit du 11 novembre (voir [Règles des agents](regles-agents.md)).

## Ce qui a été fait

- Trois types de plus dans `SECTION_KINDS` (`src/model/types.ts`) : `volunteering`, `certifications`, `publications`, rangés après `projects` (ordre des boutons de « Ajouter une section »). `NEW_KINDS` les liste ; `ONE_DATE_KINDS` désigne les deux types à date unique.
- Aucun nouveau champ dans le modèle : on réutilise `Item`.
  - Bénévolat = une expérience : rôle, association, lieu, début, fin, « en cours », description à puces.
  - Certification : intitulé, organisme, une date. Publication : titre, revue ou éditeur, une date. La date est gardée dans `start` (`formatPeriod` l'imprime seule) et saisie avec le même `DatePick` que les autres dates, libellé « Date ».
- Libellés (titre imprimé, nom du type, champs, résumé replié, « Date », exemples gris) dans les 7 langues, réunis dans `src/i18n/newSections.ts` ; `labels.ts`, `ui.ts`, `sections.ts` et le formulaire les reprennent par décomposition (`...newSections.fr.titles`).
- Titres standards imprimés : fr Bénévolat, Certifications, Publications ; en Volunteer experience, Certifications, Publications ; es Voluntariado, Certificaciones, Publicaciones ; de Ehrenamtliches Engagement, Zertifikate, Publikationen ; it Volontariato, Certificazioni, Pubblicazioni ; pt Voluntariado, Certificações, Publicações ; ar العمل التطوعي، الشهادات المهنية، المنشورات.
- Mises en page :
  - à une colonne, rien à changer : ces types passent par la branche générique (`Entry`). `chronologie` met le bénévolat sur sa frise, avec l'expérience et la formation ; `blocs` le découpe comme une expérience quand il est long.
  - à deux colonnes, `meta.apart` : les certifications vont dans le bloc à part (colonne latérale de `moderne`, `colonne-pleine`, `lateral-droit` ; grille de `grille` et `compact`). Le bénévolat reste avec l'expérience. Les publications restent dans la colonne principale, sauf `compact` qui met déjà projets et sections libres dans sa grille.
  - colonne latérale : nouveau `SideEntry` (`src/templates/shared.tsx`) : intitulé en gras, puis « organisme · date ». Sans lui, la colonne n'imprimait ni l'organisme ni la date.
- Nettoyage (`src/model/sanitize.ts`) : les nouveaux types survivent à l'import et au rechargement (le filtre `SECTION_KINDS` les écartait). Pour une certification ou une publication, `place`, `end`, `current` et `text` sont vidés : le formulaire ne les montre pas, ils s'imprimeraient sans pouvoir se corriger.
- Mode guidé : l'étape « Autres sections » ne propose pas ces types (`OTHERS_ADD` dans `src/ui/Guided.tsx`) ; une section ajoutée en mode complet y apparaît et s'y modifie.
- Repli, résumé, glisser, sommaire, annulation, aperçu relié, export et import JSON : rien de spécifique, ces fonctions sont génériques ; les tests le vérifient.

## Contrôles

- `src/model/nouvellesSections.test.ts` : libellés des 7 langues, résumé, nettoyage, export puis import, `apart` des 15 modèles à deux colonnes, aperçu relié.
- `tests/e2e/nouvelles-sections.spec.ts` : ajout et saisie des trois types, PDF téléchargé, colonne latérale de Moderne, repli et résumé gardés au rechargement, sommaire, glisser, supprimer puis Annuler, clic dans l'aperçu, mode guidé.
- `pnpm check:pdf` : `withNewSections` (`src/model/sample.ts`) ajoute les trois sections, remplies avec les exemples gris de la langue.
  - `check-pdf.ts` : le CV long en contient (36 modèles en anglais et en arabe, et les 6 paires de polices dans les langues latines) ; leurs titres doivent sortir.
  - `check-pdf-ats.ts` : contrôles ATS (titres présents et entiers) et de pagination (titre jamais seul en bas de page) avec ces sections.
  - Règle « ordre » étendue : les trois sections sont mises en tête et doivent sortir avant les sections de leur groupe qui les suivent. `compact` remplit sa grille en alternant les colonnes, et le texte extrait suit une colonne puis l'autre : la règle y compare colonne par colonne. Essai à rebours : une mise en page qui repousse les certifications à la fin échoue.

## Décisions

- Pas de champ description pour les certifications et publications : la demande disait « organisme et date », « titre, revue et date ». À ajouter si quelqu'un veut un numéro de certificat ou des co-auteurs.
- Certifications dans la colonne latérale : c'est leur place habituelle dans un CV à deux colonnes, et chaque élément tient en deux lignes.
- Pas de migration des sections libres titrées « Bénévolat » (le profil d'exemple « Premier emploi » en a une) vers le nouveau type : on ne touche pas aux données saisies.
- Le CV d'exemple n'inclut pas ces sections : la plupart des tests e2e reposent sur sa forme.

## Limites

- La colonne latérale n'imprime son contenu que sur une page ; plus elle est remplie, plus le risque de débordement grandit (limite déjà connue, voir [Glisser et repli](sections-glisser-replier.md)).
- Constaté, sans lien avec ce lot : sur un CV de 3 pages, `moderne-1` dessine le contenu de sa colonne latérale (photo, contact, compétences) sur la dernière page et non sur la première. C'est déjà le cas sans les nouvelles sections (CV long de `check:pdf`, vérifié page par page). Les autres modèles à colonne latérale n'ont pas été vérifiés. Le texte extrait est complet, ce qui explique que `check:pdf` ne le voie pas.
- Les langues autres que l'anglais et l'arabe ne sont rendues avec ces sections que dans `classique` (jobs « police ») ; les titres des 7 langues sont vérifiés par le test unitaire, pas par un rendu de chaque modèle.
