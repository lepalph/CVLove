# Aperçu multipage

Écrit le 2026-11-02. État trouvé au commit `d75f031`.

## État trouvé

- `PdfCanvas` peignait déjà toutes les pages, mais plafonnait à 20 (`maxPages = 20`) sans le dire. La barre « N pages · 1 · 2 … » s'arrêtait aussi à 20.
- La barre existait (saut par numéro) mais sans page courante, sans précédente/suivante.
- Le rendu est en double tampon (les canvas sont peints hors écran puis échangés), donc pas de clignotement, mais le défilement n'était pas protégé si la hauteur change.

## Choix faits

- Plafond relevé à `MAX_PAGES = 30` (un canvas par page, mémoire). Au-delà, un message sous l'aperçu l'indique (`src/i18n/pages.ts`, 7 langues) ; le PDF téléchargé reste complet.
- Page courante : `IntersectionObserver` sur les canvas (réobservés à chaque rendu « ready »), la page la plus visible gagne ; `aria-current="page"` et fond marqué sur son numéro.
- Boutons précédente/suivante (désactivés aux bouts), chevrons retournés en RTL (`rtl:rotate-180`) ; l'ordre de la barre suit `dir` (flex), vérifié en arabe.
- Défilement conservé : avant l'échange des canvas, `PdfCanvas` relève le `scrollTop` des ancêtres et de la fenêtre, et ne le réécrit que s'il a bougé (réécrire la même valeur coupe un défilement animé).
- Même composant `PreviewPane` pour le CV et la lettre, bureau et mobile : aucun changement dans `Editor.tsx` ni `LetterEditor.tsx`. Zoom inchangé.

## Preuves

- `tests/e2e/pages.spec.ts` : CV de 3 pages (3 canvas, clic sur « 3 », défilement à la main, précédente/suivante, clavier), frappe sans saut (position de la page 2 stable à 2 px près, canvas bien remplacé), mobile 390 px onglet Aperçu, lettre.
- Captures vues à 1440 px, 390 px et en arabe.

## Limites

- Plafond de 30 pages ; toutes sont peintes avant l'échange (un document très long met plus longtemps à apparaître).
- Si le nombre de pages ou leur hauteur change pendant la frappe, le contenu bouge forcément ; seul le `scrollTop` est conservé.
- Avec beaucoup de pages, la barre passe sur plusieurs lignes.
- `tests/e2e/lot-c.spec.ts` échoue avec `OUT_DIR` tant que `scripts/serve-dist.ts` lit `dist/` (corrigé sur la branche principale, commit `24b9912`).
