import type { Lang, SectionKind } from '../model/types'
import { newSections } from './newSections'

/** Libellés DU CV (pas de l'interface) : ce qui est imprimé sur la feuille. */
export interface CVLabels {
  sections: Record<SectionKind, string>
  present: string
  born: string
  /** Niveaux 1 à 5 affichés en texte (skillDisplay = 'text' sans texte libre). */
  levels: [string, string, string, string, string]
}

const L = (
  profile: string, experience: string, education: string, skills: string,
  languages: string, projects: string, interests: string, custom: string,
  present: string, born: string, levels: CVLabels['levels'], more: (typeof newSections)[Lang]['titles'],
): CVLabels => ({
  sections: { profile, experience, education, skills, languages, projects, interests, custom, ...more },
  present,
  born,
  levels,
})

export const cvLabels: Record<Lang, CVLabels> = {
  fr: L('Profil', 'Expérience professionnelle', 'Formation', 'Compétences', 'Langues', 'Projets', "Centres d'intérêt", 'Informations complémentaires', 'Présent', 'Né(e) le', ['Débutant', 'Élémentaire', 'Intermédiaire', 'Avancé', 'Expert'], newSections.fr.titles),
  en: L('Profile', 'Work experience', 'Education', 'Skills', 'Languages', 'Projects', 'Interests', 'Additional information', 'Present', 'Born', ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'], newSections.en.titles),
  es: L('Perfil', 'Experiencia profesional', 'Formación', 'Competencias', 'Idiomas', 'Proyectos', 'Intereses', 'Información adicional', 'Actualidad', 'Nacido/a el', ['Principiante', 'Básico', 'Intermedio', 'Avanzado', 'Experto'], newSections.es.titles),
  de: L('Profil', 'Berufserfahrung', 'Ausbildung', 'Kenntnisse', 'Sprachen', 'Projekte', 'Interessen', 'Weitere Angaben', 'Heute', 'Geboren am', ['Anfänger', 'Grundkenntnisse', 'Mittel', 'Fortgeschritten', 'Experte'], newSections.de.titles),
  it: L('Profilo', 'Esperienza professionale', 'Formazione', 'Competenze', 'Lingue', 'Progetti', 'Interessi', 'Altre informazioni', 'Presente', 'Nato/a il', ['Principiante', 'Elementare', 'Intermedio', 'Avanzato', 'Esperto'], newSections.it.titles),
  pt: L('Perfil', 'Experiência profissional', 'Formação', 'Competências', 'Idiomas', 'Projetos', 'Interesses', 'Informações adicionais', 'Atual', 'Nascido/a em', ['Iniciante', 'Básico', 'Intermédio', 'Avançado', 'Especialista'], newSections.pt.titles),
  ar: L('نبذة شخصية', 'الخبرة المهنية', 'التعليم', 'المهارات', 'اللغات', 'المشاريع', 'الاهتمامات', 'معلومات إضافية', 'حتى الآن', 'تاريخ الميلاد', ['مبتدئ', 'أساسي', 'متوسط', 'متقدم', 'خبير'], newSections.ar.titles),
}

/** Titre affiché : titre personnalisé s'il existe, sinon libellé de la langue du CV. */
export const sectionTitle = (s: { kind: SectionKind; title: string }, labels: CVLabels) =>
  s.title.trim() || labels.sections[s.kind]
