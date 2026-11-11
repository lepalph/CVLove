# Aperçu relié au formulaire

Écrit le 2026-11-11. Base : `lepalph/CVLove@ab9ba40`. P1 de la [synthèse du panel](panel-synthese.md), idée 1 d'[Engelbart](panel-engelbart.md).

## Ce qui marche

- Un clic (ou un toucher) sur une ligne de l'aperçu met le focus sur son champ : nom → Prénom, poste, contacts, titre de section → « Titre de la section », titre, sous-titre, lieu ou description d'une entrée, date → mois de début, niveau → liste du niveau (compétence ou CECRL).
- Section repliée : elle se déplie (même `patchSection(..., { collapsed: undefined })` que le chevron). Sur mobile, depuis l'onglet Aperçu, l'onglet Modifier s'affiche. Le champ défile au centre (`scrollIntoView`, doux sauf `prefers-reduced-motion`), donc il ne passe pas sous le sommaire collant.
- Au survol à la souris : curseur main, cadre fin autour de la ligne, infobulle « Modifier dans le formulaire » (`src/i18n/previewLink.ts`, 7 langues). Une ligne qui ne mène à rien (« Contact » du modèle Moderne, puce seule, blanc) reste inerte.
- Vérifié sur Classique (1 colonne), Moderne (2 colonnes, colonne latérale comprise) et en arabe : `tests/e2e/apercu-relie.spec.ts` (4 tests) et `src/ui/previewMap.test.ts` (5 tests).

## Méthode retenue : le texte de pdf.js rapproché des données du CV

`PdfCanvas` lit `page.getTextContent()` pour chaque page qu'il peint (seulement si `onText` est passé, donc pas pour les vignettes) et donne les lignes en fractions de la page. `src/ui/previewMap.ts` trouve la ligne sous le pointeur (`lineAt`), puis l'élément du CV dont elle reprend les mots (`locate`), puis le champ du formulaire (`fieldEl`, par `data-rid` déjà présent et un nouvel attribut `data-field`).

Pourquoi pas des liens ou ancres posés par react-pdf :
- Il faudrait les poser dans les 12 mises en page (`<Link>` ou `id` sur chaque bloc), et dans chaque futur modèle.
- `<Link>` reçoit d'office `color: blue` et un soulignement (`DEFAULT_LINK_STYLES` de `@react-pdf/layout`) et ajoute un nœud de mise en page : l'aperçu risquait de ne plus être le PDF téléchargé. Un `id` ne donne qu'un point (destination nommée, coin haut-gauche), pas la boîte du bloc : insuffisant en deux colonnes.
- Le texte, lui, est déjà là : rien n'est ajouté au rendu, l'aperçu et le téléchargement restent les mêmes octets. `pnpm check:pdf` : 499/499.

Le rapprochement :
- Mots normalisés : NFKC, minuscules, sans diacritiques, puis **lettres triées**. En arabe, pdf.js sort la ligature lam-alif à l'envers (« األداء » pour « الأداء ») et met « ٪18 » pour « 18٪ » : trier les lettres et ignorer la ponctuation absorbe les deux.
- Chaque élément du CV (identité, poste, chaque contact, chaque titre de section, chaque entrée) est comparé avec ce que les modèles impriment, dates mises en forme par `formatPeriod` et niveaux par `labels.levels` / `cefrText` compris. On garde l'élément qui couvre le plus de mots de la ligne (au moins la moitié), puis le champ le plus précis : « Compétences » va au titre de section, pas à une description qui contient le mot. Dans une entrée, le texte saisi passe avant la date ou le niveau.
- Lignes identiques (« Avancé » deux fois) : la n-ième ligne va au n-ième élément dans l'ordre du CV. Deux diplômes du même établissement se départagent par leurs années.

## Accessibilité

Le clic est un raccourci pour la souris et le doigt. La feuille garde `role="img"`, ne prend pas le focus et n'a pas de gestionnaire clavier : le formulaire reste le chemin principal au clavier. Le focus arrive sur un vrai champ, annoncé avec son libellé ; aucun piège.

## Décisions

- Mode guidé : seule une ligne dont le champ est dans l'étape affichée est reliée (les autres restent inertes, sans curseur main). Changer d'étape aurait demandé de toucher `Guided.tsx`, réservé à un autre agent.
- CV vide : l'aperçu montre l'exemple, rien n'est relié.
- Le cadre de survol est en gris foncé fixe (`neutral-900/40`), pas en `ink` : la feuille reste blanche en thème sombre.
- La description s'ouvre au début du champ, pas à la ligne cliquée (placer le curseur dans le `textarea` : plus tard si besoin).
- 2026-11-11, sens inverse fait (champ actif → ligne allumée dans l'aperçu, Engelbart 2) : un écouteur `focusin`/`focusout` sur le document dans `PreviewPane` (rien dans `Form.tsx`) lit `data-rid` et `data-field` du champ actif, et `linesOf` (`previewMap.ts`) rejoue `locate` sur chaque ligne pour garder celles qui mènent à ce champ. Même cadre que le survol (`neutral-900/40`), posé en `aria-hidden` : rien n'est annoncé, la feuille reste `role="img"`. L'aperçu ne défile pas (la ligne peut être hors de vue). Prénom et Nom allument la même ligne ; sans correspondance exacte (Lieu, dans une ligne « Entreprise · Lieu | dates »), toute l'entrée s'allume. Mobile, onglet Aperçu caché et mode guidé : rien ne casse, l'allumage peut ne pas se voir. Test : `apercu-relie.spec.ts` (5e test) et `previewMap.test.ts`.

## Limites

- Un élément dont le texte apparaît tel quel deux fois, dans deux colonnes différentes, peut être pris l'un pour l'autre si l'ordre d'impression diffère de l'ordre du CV. On tombe au moins dans une section du même texte.
- Seuls Classique et Moderne sont testés en e2e ; les 10 autres mises en page reposent sur le même texte extrait, non vérifiées une à une.
- Non vérifié : Safari et Firefox, un vrai téléphone (toucher émulé par Playwright).
