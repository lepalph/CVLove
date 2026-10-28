import type { ComponentType } from 'react'
import type { CVLabels } from '../i18n/labels'
import type { LetterLabels } from '../i18n/letter'
import type { CV, Design, Lang, Letter } from '../model/types'

/**
 * CONTRAT DES TEMPLATES (v2)
 * ==========================
 * Vocabulaire : une MISE EN PAGE est un composant react-pdf (`layouts/<id>.tsx`) ; un STYLE est un preset de design
 * (police, couleur, forme de photo, niveaux) + une `variant` (chaîne) que le composant interprète ; un MODÈLE = mise en page + style.
 * Id d'un modèle = `<id de mise en page>-<n° du style, de 1 à 3>` (ex. `moderne-2`) ; c'est `design.templateId`.
 *
 * Ajouter une mise en page = UN fichier `src/templates/layouts/<id>.tsx`, sans toucher au registre (`index.ts` le construit
 * avec `import.meta.glob`). Le fichier exporte :
 *   - `meta: LayoutMeta`  : id (= nom du fichier), nom par langue d'interface, catégorie, colonnes, photo, `order` (rang dans la galerie)
 *                           et EXACTEMENT 3 styles. Ne jamais réordonner ni supprimer un style existant (les ids des documents enregistrés en dépendent).
 *   - `Component`         : `(LayoutProps) => <Document>` react-pdf. Modèle à suivre : `layouts/classique.tsx` (une colonne) et `moderne.tsx` (deux colonnes).
 * Étapes : 1) copier le fichier le plus proche ; 2) changer `meta` (3 styles : `name` propre, sans traduction ; `variant` ; `preset` = accent,
 * fontPair, photoShape, skillDisplay… — le preset est appliqué à chaque choix du modèle, l'utilisateur peut ensuite tout surcharger) ;
 * 3) faire varier la structure ou l'en-tête selon `variant` ; 4) `pnpm check:pdf` (rend tous les modèles x 7 langues + cas limites) et regarder `out/<id>-1-fr.png` etc. ;
 * 5) le style n° 1 sert aussi de modèle « par défaut » de sa mise en page.
 *
 * Le composant reçoit `{ cv, design, labels, variant }` et DOIT respecter toutes les options de design, via `makeTheme` (theme.ts) :
 *   const t = makeTheme(cv, design, labels)
 *   t.head / t.body        familles de police (paire choisie ; Tajawal en arabe) ; n'utiliser que les graisses 400 et 700
 *   t.s(n)                 taille de police en pt x fontScale  -> TOUS les fontSize passent par t.s()
 *   t.m(n)                 marge / espacement x réglage de marges (compact 0.75, normal 1, large 1.3) -> paddings de page via t.m()
 *   t.pageProps / t.pageStyle(padV, padH)   <Page {...t.pageProps} style={t.pageStyle(40, 44)}> : format A4/Letter, police, interligne, RTL
 *   t.accent, t.row, t.rtl, t.start/t.end   couleur, 'row' | 'row-reverse', 'left'|'right' selon le sens de lecture (yoga n'hérite pas de `direction` pour les rangées)
 *   t.photo(size)          style (width, height, borderRadius, objectFit) selon design.photoShape ; <Image src={cv.personal.photo} style={t.photo(80)} />
 * Helpers de rendu dans `shared.tsx` : <Lines> (puces), <ContactRow>, contactList, fixBidi (RTL), tint (fond teinté de l'accent),
 *   shade (accent assombri), onAccent (texte lisible sur un fond de couleur libre), <SkillLevel> (niveau 1-5 en barres / points / texte
 *   selon design.skillDisplay), entryMeta (période + sous-titre d'un item).
 * Du modèle de données : visibleSections / visibleFields / fullName (model/cv), sectionTitle (i18n/labels), formatPeriod / formatDay (model/dates).
 * `meta` doit rester un littéral pur (pas de variable ni d'import dedans), déclaré `export const meta: LayoutMeta = {` avec son `}` fermant seul en début
 * de ligne : le plugin `vite-layout-meta.ts` l'extrait pour que le premier chargement n'embarque pas react-pdf.
 * Règles : sections vides masquées (visibleSections), `wrap={false}` sur les entrées, `minPresenceAhead` sur les titres, aucune césure,
 * le contenu saisi n'est jamais traduit, la couleur libre peut être très claire ou très foncée (utiliser tint/shade/onAccent).
 * Test visuel : `pnpm check:pdf` écrit les PNG dans `out/`. Les scripts Node chargent les sources via Vite (`scripts/vite-load.ts`) : c'est ce qui
 * fait marcher `import.meta.glob` hors du navigateur.
 */
export interface LayoutProps {
  cv: CV
  design: Design
  labels: CVLabels
  /** `StyleDef.variant` du modèle choisi. */
  variant: string
}

export const CATEGORIES = ['classique', 'moderne', 'creatif', 'simple'] as const
export type Category = (typeof CATEGORIES)[number]

export interface StyleDef {
  /** Nom propre du style (même dans toutes les langues). */
  name: string
  variant: string
  /** Valeurs de design appliquées quand l'utilisateur choisit ce modèle. */
  preset: Partial<Omit<Design, 'templateId'>>
}

export interface LayoutMeta {
  /** Nom du fichier sans extension. */
  id: string
  name: Record<Lang, string>
  category: Category
  columns: 1 | 2
  /** La mise en page affiche la photo. */
  photo: boolean
  /** Rang dans la galerie. */
  order: number
  styles: [StyleDef, StyleDef, StyleDef]
}

export interface LayoutModule {
  Component: ComponentType<LayoutProps>
  meta: LayoutMeta
}

/** Un modèle (mise en page x style) tel que le registre le sert à la galerie et au rendu. */
export interface TemplateDef {
  id: string
  layoutId: string
  layoutName: Record<Lang, string>
  styleName: string
  category: Category
  columns: 1 | 2
  photo: boolean
  variant: string
  preset: StyleDef['preset']
  /** Chargement différé du composant : react-pdf n'entre pas dans le premier chargement. */
  load: () => Promise<{ Component: ComponentType<LayoutProps> }>
}

/** Pastilles d'accent proposées (la couleur reste libre). */
export const ACCENTS = ['#c2410c', '#1d4ed8', '#047857', '#7c3aed', '#be185d', '#0e7490', '#374151'] as const

/**
 * LETTRES DE MOTIVATION : même principe que les mises en page de CV, dans `letters/<id>.tsx` (id = nom du fichier = `design.templateId`,
 * préfixé `lettre-`), registre automatique `letterTemplates.ts`. Le fichier exporte `meta: LetterMeta` (littéral pur, comme pour les CV)
 * et `Component: (LetterProps) => <Document>`. Même thème (`makeTheme(letter, design, cvLabels[letter.lang])`) : taille, interligne,
 * marges, A4 / Letter, RTL. Les morceaux communs (destinataire, objet, paragraphes, politesse) sont dans `letterShared.tsx`.
 */
export interface LetterProps {
  letter: Letter
  design: Design
  labels: LetterLabels
}

export interface LetterMeta {
  /** Nom du fichier sans extension, = `design.templateId`. */
  id: string
  name: Record<Lang, string>
  order: number
}

export interface LetterModule {
  Component: ComponentType<LetterProps>
  meta: LetterMeta
}
