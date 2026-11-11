import type { Cefr, Lang } from '../model/types'

/** Niveaux de langue du CECRL, avec leur nom dans chaque langue (imprimés sur le CV et listés dans le formulaire). */
export const cefrNames: Record<Lang, Record<Cefr, string>> = {
  fr: { A1: 'Débutant', A2: 'Élémentaire', B1: 'Intermédiaire', B2: 'Intermédiaire supérieur', C1: 'Avancé', C2: 'Maîtrise', native: 'Langue maternelle' },
  en: { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper intermediate', C1: 'Advanced', C2: 'Proficient', native: 'Native' },
  de: { A1: 'Anfänger', A2: 'Grundkenntnisse', B1: 'Mittelstufe', B2: 'Gute Mittelstufe', C1: 'Fortgeschritten', C2: 'Annähernd muttersprachlich', native: 'Muttersprache' },
  es: { A1: 'Principiante', A2: 'Elemental', B1: 'Intermedio', B2: 'Intermedio alto', C1: 'Avanzado', C2: 'Dominio', native: 'Lengua materna' },
  it: { A1: 'Principiante', A2: 'Elementare', B1: 'Intermedio', B2: 'Intermedio superiore', C1: 'Avanzato', C2: 'Padronanza', native: 'Madrelingua' },
  pt: { A1: 'Iniciante', A2: 'Elementar', B1: 'Intermédio', B2: 'Intermédio superior', C1: 'Avançado', C2: 'Domínio', native: 'Língua materna' },
  ar: { A1: 'مبتدئ', A2: 'أساسي', B1: 'متوسط', B2: 'فوق المتوسط', C1: 'متقدم', C2: 'إتقان', native: 'اللغة الأم' },
}

/** Libellé du champ « niveau » d'une langue dans le formulaire. */
export const cefrFieldLabel: Record<Lang, string> = {
  fr: 'Niveau (CECRL)', en: 'Level (CEFR)', de: 'Niveau (GER)', es: 'Nivel (MCER)', it: 'Livello (QCER)', pt: 'Nível (QECR)', ar: 'المستوى (الإطار الأوروبي)',
}

/** Avertissement près du bouton photo quand le modèle choisi ne l'affiche pas. */
export const photoHidden: Record<Lang, string> = {
  fr: "Ce modèle n'affiche pas la photo. Choisissez un modèle avec photo dans Design.",
  en: "This template doesn't show the photo. Pick a template with a photo in Design.",
  de: 'Diese Vorlage zeigt kein Foto. Wählen Sie unter Design eine Vorlage mit Foto.',
  es: 'Esta plantilla no muestra la foto. Elige una plantilla con foto en Diseño.',
  it: 'Questo modello non mostra la foto. Scegli un modello con foto in Design.',
  pt: 'Este modelo não mostra a foto. Escolha um modelo com foto em Design.',
  ar: 'هذا القالب لا يعرض الصورة. اختر قالبًا يعرض الصورة من قسم التصميم.',
}

/** « B2 · Intermédiaire supérieur » ; la langue maternelle s'écrit sans code. */
export const cefrText = (c: Cefr, lang: Lang) => (c === 'native' ? cefrNames[lang].native : `${c} · ${cefrNames[lang][c]}`)
