# Colonne latérale sur la bonne page

Daté du 2026-11-11, base `b946a61`. Bug signalé dans [Nouvelles sections](nouvelles-sections.md) (Limites).

## Symptôme

Sur un CV de 3 pages ou plus, `moderne-1` (et ses variantes 2 et 3) dessinait la photo, le contact et les compétences sur la dernière page, pas sur la première. `pnpm check:pdf` ne le voyait pas : le texte extrait était complet.

## Cause

Dans `src/templates/layouts/moderne.tsx`, la colonne est une `View` en `position: 'absolute'`, déclarée **après** le flux des sections (pour que le nom sorte avant elle dans le texte extrait). react-pdf pose un enfant absolu sur la page où il tombe dans le flux, donc sur celle où le flux se termine : la dernière. Le fond (`fixed`) est répété sur chaque page, ce qui cachait le défaut à l'œil sur le seul fond.

## Preuve

Rendu de 9 expériences, texte lu page par page avec pdf.js (mots « Camille », « exemple.fr », « Compétences »), avant correctif :

- `moderne-1/2/3` : e-mail et « Compétences » en page 3 sur 3, nom en page 1.
- Les 10 autres mises en page, dont `colonne-pleine`, `lateral-droit`, `compact`, `grille` (`meta.apart`) : contact en page 1. `colonne-pleine` déclare sa colonne avant le flux (page 1, y compris « Compétences ») ; `lateral-droit` et `compact` sont des lignes flex dont la colonne démarre en page 1 ; `grille` et les autres mettent les compétences dans le flux.
- Nuance : sur un autre CV (4 pages, `check-pdf-ats` avec 9 postes courts) `moderne-1` a mis sa colonne en page 1 ; le défaut dépend de la longueur. Le contrôle ci-dessous échoue avant correctif sur `moderne-2` et `moderne-3`.

## Correctif

La colonne est maintenant déclarée juste après le nom et avant le flux : toujours en page 1, rendu des CV de 1 et 2 pages inchangé (positions absolues identiques), et le nom sort toujours avant « Contact » et « Compétences » dans le texte extrait. Seul `moderne.tsx` était concerné ; aucune couche partagée ne produit ce défaut (la colonne absolue est écrite dans chaque mise en page).

## Garde-fou

`scripts/check-pdf-ats.ts` (`pnpm check:pdf`) : pour chaque modèle, un CV de 9 postes (3 pages ou plus exigées) doit avoir le prénom et l'e-mail sur la page 1.

## Non vérifié

Relecture visuelle des PNG sur 3 pages ; langue arabe (colonne côté droit) vérifiée par le seul rendu `check:pdf`.
