import type { Lang, NEW_KINDS } from '../model/types'
import type { Ph } from './placeholders'

type K = (typeof NEW_KINDS)[number]

/**
 * Libellés des sections ajoutées le 2026-11-11 (bénévolat, certifications, publications), réunis ici pour ne pas disperser la fonction ;
 * `labels.ts`, `ui.ts`, `sections.ts` et le formulaire les reprennent. Voir docs/wiki/nouvelles-sections.md.
 */
export interface NewSectionsText {
  /** Titre standard imprimé sur le CV (langue du CV). */
  titles: Record<K, string>
  /** Nom du type dans « Ajouter une section » (langue de l'interface). */
  kinds: Record<K, string>
  /** Champs d'un élément : [titre, sous-titre, texte] ; '' = champ absent. */
  fields: Record<K, [string, string, string]>
  /** « singulier|pluriel » du résumé d'une section repliée. */
  nouns: Record<K, string>
  /** Libellé de la date unique des certifications et publications. */
  date: string
  /** Exemples gris des champs. */
  ph: Record<K, Ph>
}

export const newSections: Record<Lang, NewSectionsText> = {
  fr: {
    titles: { volunteering: 'Bénévolat', certifications: 'Certifications', publications: 'Publications' },
    kinds: { volunteering: 'Bénévolat', certifications: 'Certifications', publications: 'Publications' },
    fields: { volunteering: ['Rôle', 'Association', 'Description'], certifications: ['Certification', 'Organisme', ''], publications: ['Titre', 'Revue ou éditeur', ''] },
    nouns: { volunteering: 'mission|missions', certifications: 'certification|certifications', publications: 'publication|publications' },
    date: 'Date',
    ph: {
      volunteering: { title: 'Bénévole', subtitle: 'Banque alimentaire', place: 'Lyon', text: '- Tri et distribution des colis' },
      certifications: { title: 'Sauveteur secouriste du travail', subtitle: 'INRS' },
      publications: { title: 'Le commerce de proximité aujourd’hui', subtitle: 'Revue du commerce' },
    },
  },
  en: {
    titles: { volunteering: 'Volunteer experience', certifications: 'Certifications', publications: 'Publications' },
    kinds: { volunteering: 'Volunteering', certifications: 'Certifications', publications: 'Publications' },
    fields: { volunteering: ['Role', 'Organisation', 'Description'], certifications: ['Certification', 'Issuer', ''], publications: ['Title', 'Journal or publisher', ''] },
    nouns: { volunteering: 'role|roles', certifications: 'certification|certifications', publications: 'publication|publications' },
    date: 'Date',
    ph: {
      volunteering: { title: 'Volunteer', subtitle: 'Food bank', place: 'Manchester', text: '- Sorted and handed out food parcels' },
      certifications: { title: 'First Aid at Work', subtitle: 'St John Ambulance' },
      publications: { title: 'Local shops today', subtitle: 'Retail Review' },
    },
  },
  es: {
    titles: { volunteering: 'Voluntariado', certifications: 'Certificaciones', publications: 'Publicaciones' },
    kinds: { volunteering: 'Voluntariado', certifications: 'Certificaciones', publications: 'Publicaciones' },
    fields: { volunteering: ['Función', 'Organización', 'Descripción'], certifications: ['Certificación', 'Entidad emisora', ''], publications: ['Título', 'Revista o editorial', ''] },
    nouns: { volunteering: 'actividad|actividades', certifications: 'certificación|certificaciones', publications: 'publicación|publicaciones' },
    date: 'Fecha',
    ph: {
      volunteering: { title: 'Voluntaria', subtitle: 'Banco de alimentos', place: 'Sevilla', text: '- Clasificación y reparto de lotes' },
      certifications: { title: 'Primeros auxilios', subtitle: 'Cruz Roja Española' },
      publications: { title: 'El comercio de barrio hoy', subtitle: 'Revista de Comercio' },
    },
  },
  de: {
    titles: { volunteering: 'Ehrenamtliches Engagement', certifications: 'Zertifikate', publications: 'Publikationen' },
    kinds: { volunteering: 'Ehrenamt', certifications: 'Zertifikate', publications: 'Publikationen' },
    fields: { volunteering: ['Rolle', 'Organisation', 'Beschreibung'], certifications: ['Zertifikat', 'Aussteller', ''], publications: ['Titel', 'Zeitschrift oder Verlag', ''] },
    nouns: { volunteering: 'Engagement|Engagements', certifications: 'Zertifikat|Zertifikate', publications: 'Publikation|Publikationen' },
    date: 'Datum',
    ph: {
      volunteering: { title: 'Ehrenamtliche Helferin', subtitle: 'Kölner Tafel', place: 'Köln', text: '- Lebensmittel sortiert und ausgegeben' },
      certifications: { title: 'Erste-Hilfe-Kurs', subtitle: 'Deutsches Rotes Kreuz' },
      publications: { title: 'Der Einzelhandel heute', subtitle: 'Handelsjournal' },
    },
  },
  it: {
    titles: { volunteering: 'Volontariato', certifications: 'Certificazioni', publications: 'Pubblicazioni' },
    kinds: { volunteering: 'Volontariato', certifications: 'Certificazioni', publications: 'Pubblicazioni' },
    fields: { volunteering: ['Ruolo', 'Associazione', 'Descrizione'], certifications: ['Certificazione', 'Ente', ''], publications: ['Titolo', 'Rivista o editore', ''] },
    nouns: { volunteering: 'attività|attività', certifications: 'certificazione|certificazioni', publications: 'pubblicazione|pubblicazioni' },
    date: 'Data',
    ph: {
      volunteering: { title: 'Volontaria', subtitle: 'Banco alimentare', place: 'Bologna', text: '- Smistamento e consegna dei pacchi' },
      certifications: { title: 'Primo soccorso', subtitle: 'Croce Rossa Italiana' },
      publications: { title: 'Il commercio di vicinato oggi', subtitle: 'Rivista del Commercio' },
    },
  },
  pt: {
    titles: { volunteering: 'Voluntariado', certifications: 'Certificações', publications: 'Publicações' },
    kinds: { volunteering: 'Voluntariado', certifications: 'Certificações', publications: 'Publicações' },
    fields: { volunteering: ['Função', 'Organização', 'Descrição'], certifications: ['Certificação', 'Entidade emissora', ''], publications: ['Título', 'Revista ou editora', ''] },
    nouns: { volunteering: 'atividade|atividades', certifications: 'certificação|certificações', publications: 'publicação|publicações' },
    date: 'Data',
    ph: {
      volunteering: { title: 'Voluntária', subtitle: 'Banco Alimentar', place: 'Porto', text: '- Triagem e entrega de cabazes' },
      certifications: { title: 'Primeiros socorros', subtitle: 'Cruz Vermelha Portuguesa' },
      publications: { title: 'O comércio de bairro hoje', subtitle: 'Revista do Comércio' },
    },
  },
  ar: {
    titles: { volunteering: 'العمل التطوعي', certifications: 'الشهادات المهنية', publications: 'المنشورات' },
    kinds: { volunteering: 'العمل التطوعي', certifications: 'الشهادات المهنية', publications: 'المنشورات' },
    fields: { volunteering: ['الدور', 'الجهة', 'الوصف'], certifications: ['الشهادة', 'الجهة المانحة', ''], publications: ['العنوان', 'المجلة أو دار النشر', ''] },
    nouns: { volunteering: 'نشاط|أنشطة', certifications: 'شهادة|شهادات', publications: 'منشور|منشورات' },
    date: 'التاريخ',
    ph: {
      volunteering: { title: 'متطوعة', subtitle: 'بنك الطعام', place: 'الرباط', text: '- فرز السلال الغذائية وتوزيعها' },
      certifications: { title: 'الإسعافات الأولية', subtitle: 'الهلال الأحمر' },
      publications: { title: 'تجارة القرب اليوم', subtitle: 'مجلة التجارة' },
    },
  },
}
