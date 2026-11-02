import type { Lang, SectionKind } from '../model/types'

/** Textes de l'INTERFACE pour déplacer (glisser) et replier les sections. `{x}` = nom de la section, `{n}` et `{total}` = rangs. */
export interface SectionsText {
  /** Libellé de la poignée, suivi du nom de la section. */
  drag: string
  collapse: string
  expand: string
  collapseAll: string
  expandAll: string
  /** Annonce après un glisser. */
  moved: string
  /** Note après un déplacement que le PDF ne montre pas : dans un modèle à deux colonnes, chaque section garde sa colonne. */
  apart: string
  /** Résumé d'une section repliée sans contenu. */
  empty: string
  /** Nom de l'élément, « singulier|pluriel », précédé du nombre dans le résumé. */
  nouns: Record<Exclude<SectionKind, 'profile'>, string>
}

export const sectionsText: Record<Lang, SectionsText> = {
  fr: {
    drag: 'Glisser pour déplacer', collapse: 'Replier', expand: 'Déplier', collapseAll: 'Tout replier', expandAll: 'Tout déplier',
    moved: 'Section {x} déplacée en position {n} sur {total}',
    apart: 'Avec ce modèle, la section {x} reste dans sa colonne : le PDF suit l’ordre à l’intérieur de chaque colonne.', empty: 'Vide',
    nouns: { experience: 'expérience|expériences', education: 'formation|formations', skills: 'compétence|compétences', languages: 'langue|langues', projects: 'projet|projets', interests: 'centre d’intérêt|centres d’intérêt', custom: 'élément|éléments' },
  },
  en: {
    drag: 'Drag to move', collapse: 'Collapse', expand: 'Expand', collapseAll: 'Collapse all', expandAll: 'Expand all',
    moved: 'Section {x} moved to position {n} of {total}',
    apart: 'In this template, the {x} section stays in its column: the PDF follows the order within each column.', empty: 'Empty',
    nouns: { experience: 'job|jobs', education: 'course|courses', skills: 'skill|skills', languages: 'language|languages', projects: 'project|projects', interests: 'interest|interests', custom: 'entry|entries' },
  },
  de: {
    drag: 'Zum Verschieben ziehen', collapse: 'Einklappen', expand: 'Ausklappen', collapseAll: 'Alle einklappen', expandAll: 'Alle ausklappen',
    moved: 'Abschnitt {x} an Position {n} von {total} verschoben',
    apart: 'In dieser Vorlage bleibt der Abschnitt {x} in seiner Spalte: Das PDF folgt der Reihenfolge innerhalb jeder Spalte.', empty: 'Leer',
    nouns: { experience: 'Station|Stationen', education: 'Ausbildung|Ausbildungen', skills: 'Kenntnis|Kenntnisse', languages: 'Sprache|Sprachen', projects: 'Projekt|Projekte', interests: 'Interesse|Interessen', custom: 'Eintrag|Einträge' },
  },
  es: {
    drag: 'Arrastrar para mover', collapse: 'Contraer', expand: 'Expandir', collapseAll: 'Contraer todo', expandAll: 'Expandir todo',
    moved: 'Sección {x} movida a la posición {n} de {total}',
    apart: 'En esta plantilla, la sección {x} se queda en su columna: el PDF sigue el orden dentro de cada columna.', empty: 'Vacía',
    nouns: { experience: 'experiencia|experiencias', education: 'formación|formaciones', skills: 'habilidad|habilidades', languages: 'idioma|idiomas', projects: 'proyecto|proyectos', interests: 'interés|intereses', custom: 'elemento|elementos' },
  },
  it: {
    drag: 'Trascina per spostare', collapse: 'Comprimi', expand: 'Espandi', collapseAll: 'Comprimi tutto', expandAll: 'Espandi tutto',
    moved: 'Sezione {x} spostata alla posizione {n} di {total}',
    apart: 'In questo modello la sezione {x} resta nella sua colonna: il PDF segue l’ordine all’interno di ogni colonna.', empty: 'Vuota',
    nouns: { experience: 'esperienza|esperienze', education: 'formazione|formazioni', skills: 'competenza|competenze', languages: 'lingua|lingue', projects: 'progetto|progetti', interests: 'interesse|interessi', custom: 'voce|voci' },
  },
  pt: {
    drag: 'Arrastar para mover', collapse: 'Recolher', expand: 'Expandir', collapseAll: 'Recolher tudo', expandAll: 'Expandir tudo',
    moved: 'Secção {x} movida para a posição {n} de {total}',
    apart: 'Neste modelo, a secção {x} fica na sua coluna: o PDF segue a ordem dentro de cada coluna.', empty: 'Vazia',
    nouns: { experience: 'experiência|experiências', education: 'formação|formações', skills: 'competência|competências', languages: 'idioma|idiomas', projects: 'projeto|projetos', interests: 'interesse|interesses', custom: 'item|itens' },
  },
  ar: {
    drag: 'اسحب للنقل', collapse: 'طيّ', expand: 'توسيع', collapseAll: 'طيّ الكل', expandAll: 'توسيع الكل',
    moved: 'نُقل القسم {x} إلى المرتبة {n} من {total}',
    apart: 'في هذا القالب يبقى القسم {x} في عموده: يتبع ملف PDF الترتيب داخل كل عمود.', empty: 'فارغ',
    nouns: { experience: 'خبرة|خبرات', education: 'تكوين|تكوينات', skills: 'مهارة|مهارات', languages: 'لغة|لغات', projects: 'مشروع|مشاريع', interests: 'اهتمام|اهتمامات', custom: 'عنصر|عناصر' },
  },
}

/** Résumé d'une ligne d'une section repliée : « 3 expériences · Vendeuse, Caissière… » (la coupe finale est faite par le CSS). */
export function sectionSummary(s: { kind: SectionKind; items: { title: string; text: string }[] }, lang: Lang): string {
  const x = sectionsText[lang]
  if (s.kind === 'profile') return s.items.map((i) => i.text.trim()).find(Boolean) ?? x.empty
  const names = s.items.map((i) => i.title.trim()).filter(Boolean)
  if (!s.items.length) return x.empty
  const [one, many] = x.nouns[s.kind].split('|')
  const head = `${s.items.length} ${s.items.length === 1 ? one : many}`
  return names.length ? `${head} · ${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}` : head
}
