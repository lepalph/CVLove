# Tenir sur 1 page

Écrit le 2026-11-11, base `ab9ba40`. P2 de la [synthèse du panel](panel-synthese.md) (Engelbart 5, mesure d'Edison : marges serrées et texte à 0,9 ensemble).

## Décisions

- **Champ `Design.fitPage?: boolean`**. Absent = désactivé : un document existant se rend à l'identique. `cleanDesign` (src/model/sanitize.ts) ne garde que `true` ; toute autre valeur à l'import disparaît.
- **Effet dans `makeTheme` (src/templates/theme.ts)**, donc sur les 36 modèles sans toucher à aucun : `t.s()` vaut 0,9 x la taille, sans passer sous 8 pt (une taille déjà sous 8 pt n'est pas réduite) ; `t.m()` vaut 0,7 x la marge ; l'interligne perd 0,15 (plancher 1,2 ; l'arabe garde son plancher de 1,5).
- **Visibilité** : l'option n'est proposée que si l'aperçu fait plus d'une page, ou si elle est déjà cochée (sinon, une fois le CV tenu sur 1 page, on ne pourrait plus la décocher). Jamais pour la lettre.
- **Nombre de pages** : il vivait dans l'état local de `PreviewPane` (EditorParts.tsx, hors périmètre). `PdfCanvas` le publie maintenant dans `src/pdf/pageCount.ts` (`useSyncExternalStore`), seulement pour les aperçus de plus d'une page (pas les vignettes) ; remis à 0 au démontage.
- **Libellés** : `src/i18n/fitpage.ts`, 7 langues. Contrôle : case à cocher de 44 px avec une ligne d'explication, placée dans le panneau Design après les marges.

## Preuves

- `src/templates/fitPage.test.ts` (thème inchangé sans option, 0,9 et plancher 8 pt, import).
- `pnpm check:pdf` : 36 jobs « tenir sur 1 page » (exemple le plus long, sans puis avec l'option) : jamais plus de pages, une page de moins ou 1 page, texte jamais sous 8 pt. Sur les exemples, 7 modèles passent de 2 pages à 1 (creatif-1, creatif-3, executif-1 à 3, minimal-1, minimal-3).
- `tests/e2e/tenir-une-page.spec.ts` : absente à 1 page, proposée au débordement, retire une page, persiste au rechargement, se décoche.

## Limites

- Les espacements écrits en dur dans les modèles (`marginTop: 8`, etc.) ne passent pas par `t.m()` : ils ne rétrécissent pas. Le gain vient surtout du texte et des marges de page.
- Un CV qui déborde de beaucoup ne tiendra pas sur 1 page ; l'option en gagne une, pas plus.
- Texte déjà sous 8 pt dans un modèle : laissé tel quel.
