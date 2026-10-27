import type { Lang, SectionKind } from '../model/types'

/** Libellés DU CV (pas de l'interface) : ce qui est imprimé sur la feuille. */
export interface CVLabels {
  sections: Record<SectionKind, string>
  present: string
  born: string
}

const L = (
  profile: string, experience: string, education: string, skills: string,
  languages: string, projects: string, interests: string, custom: string,
  present: string, born: string,
): CVLabels => ({
  sections: { profile, experience, education, skills, languages, projects, interests, custom },
  present,
  born,
})

export const cvLabels: Record<Lang, CVLabels> = {
  fr: L('Profil', 'Expérience professionnelle', 'Formation', 'Compétences', 'Langues', 'Projets', "Centres d'intérêt", 'Informations complémentaires', 'Présent', 'Né(e) le'),
  en: L('Profile', 'Work experience', 'Education', 'Skills', 'Languages', 'Projects', 'Interests', 'Additional information', 'Present', 'Born'),
  es: L('Perfil', 'Experiencia profesional', 'Formación', 'Competencias', 'Idiomas', 'Proyectos', 'Intereses', 'Información adicional', 'Actualidad', 'Nacido/a el'),
  de: L('Profil', 'Berufserfahrung', 'Ausbildung', 'Kenntnisse', 'Sprachen', 'Projekte', 'Interessen', 'Weitere Angaben', 'Heute', 'Geboren am'),
  it: L('Profilo', 'Esperienza professionale', 'Formazione', 'Competenze', 'Lingue', 'Progetti', 'Interessi', 'Altre informazioni', 'Presente', 'Nato/a il'),
  pt: L('Perfil', 'Experiência profissional', 'Formação', 'Competências', 'Idiomas', 'Projetos', 'Interesses', 'Informações adicionais', 'Atual', 'Nascido/a em'),
  ar: L('نبذة شخصية', 'الخبرة المهنية', 'التعليم', 'المهارات', 'اللغات', 'المشاريع', 'الاهتمامات', 'معلومات إضافية', 'حتى الآن', 'تاريخ الميلاد'),
}

/** Titre affiché : titre personnalisé s'il existe, sinon libellé de la langue du CV. */
export const sectionTitle = (s: { kind: SectionKind; title: string }, labels: CVLabels) =>
  s.title.trim() || labels.sections[s.kind]
