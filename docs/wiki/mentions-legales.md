# Mentions légales et confidentialité

Date : 2026-11-11 ; base `lepalph/CVLove@33ddefc` (lot 2 de [REPRISE.md](../REPRISE.md)). Voir [Règles des agents](regles-agents.md).

## Ce qui existe
- Route `#/mentions` (`src/App.tsx`), page `src/ui/Legal.tsx`, textes des 7 langues dans `src/i18n/legal.ts`.
- Lien « Mentions légales » dans le pied de l'accueil (`Home.tsx`) et dans le pied de l'éditeur (`EdFooter`, une ligne ajoutée dans `EditorParts.tsx`, donc aussi pour la lettre). Libellé court dans `extra.legalLink` (le titre long ne tient pas dans le pied à 390 px).
- Test : `tests/e2e/mentions.spec.ts` (accueil en fr, éditeur en ar, pas de débordement à 390 px).

## Décisions
- Pas de page « Mes documents » liée : l'accueil et l'éditeur suffisent à la consigne ; la page a son propre en-tête (logo, langue) et un lien de retour.
- Le bouton d'effacement est cité avec les libellés réels de `v2.docs` et `v2.wipeAll` (pas de texte recopié qui dériverait).
- Aucun nom, adresse ni e-mail inventé : l'identité de l'éditeur reste en `[À REMPLACER]` (constante `PLACEHOLDER`).
- Vérifié dans le code : aucun cookie (`document.cookie` absent), seul `localStorage` (`cvlove:v2`, copie `cvlove:corrupt` après JSON illisible), aucune URL externe dans `index.html`, le CSS ni les polices (`public/fonts/`), CSP de `vercel.json` limitée à `'self'`, aucun outil d'audience dans `package.json`.
- Adresse de Vercel : celle de la rubrique « Contact » de vercel.com/legal/privacy-policy, lue le 2026-11-11 (440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis).
- Formulation prudente sur les journaux d'accès : Vercel « peut conserver » des journaux techniques (non vérifiable depuis le code).

## À remplacer par l'auteur (`src/i18n/legal.ts`, une ligne par langue, 7 langues)
1. Éditeur : nom ou raison sociale.
2. Éditeur : contact (adresse postale ou moyen de contact ; pas d'e-mail personnel ici sans choix de l'auteur).
3. Directeur de la publication.

## Non vérifié
- Un avis juridique : le texte suit la LCEN (art. 6) et le RGPD dans les grandes lignes, sans relecture d'un juriste. Un éditeur particulier peut préférer l'anonymat avec l'hébergeur comme contact : choix de l'auteur.
- Licences des polices : les fichiers `OFL-*.txt` sont présents, mais la correspondance exacte avec chaque `.ttf` (dont `CVLove*`) n'a pas été vérifiée.
- Les traductions (de, es, it, pt, ar) n'ont pas été relues par un natif.
