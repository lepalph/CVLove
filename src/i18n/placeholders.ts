import type { Lang, SectionKind } from '../model/types'

/** Exemples gris des champs : neutres et universels (pas calqués sur le CV d'exemple). Ce qui manque ici retombe sur le CV d'exemple de la langue. */
export interface Ph { title?: string; subtitle?: string; place?: string; text?: string }
export interface Placeholders { jobTitle: string; kinds: Partial<Record<SectionKind, Ph>> }

export const placeholders: Record<Lang, Placeholders> = {
  fr: {
    jobTitle: 'Vendeuse',
    kinds: {
      profile: { text: 'Vendeuse souriante et organisée, à l’aise avec le public.' },
      experience: { title: 'Vendeuse', subtitle: 'Boulangerie Martin', place: 'Lyon', text: '- Accueil et conseil des clients\n- Tenue de la caisse' },
      education: { title: 'Bac pro commerce', subtitle: 'Lycée Jean-Moulin', place: 'Lyon', text: '' },
      skills: { title: 'Savoir-être, Outils, Langues…', text: 'Sens du contact, Excel, ponctualité' },
      languages: { title: 'Anglais', text: 'Courant' },
      interests: { title: 'Randonnée' },
    },
  },
  en: {
    jobTitle: 'Sales assistant',
    kinds: {
      profile: { text: 'Friendly, organised sales assistant who enjoys working with people.' },
      experience: { title: 'Sales assistant', subtitle: 'Martin’s Bakery', place: 'Manchester', text: '- Welcomed and advised customers\n- Handled the till' },
      education: { title: 'Retail diploma', subtitle: 'City College', place: 'Manchester', text: '' },
      skills: { title: 'Soft skills, Tools, Languages…', text: 'Customer care, Excel, punctuality' },
      languages: { title: 'French', text: 'Fluent' },
      interests: { title: 'Hiking' },
    },
  },
  es: {
    jobTitle: 'Dependienta',
    kinds: {
      profile: { text: 'Dependienta amable y organizada, a gusto con el trato al público.' },
      experience: { title: 'Dependienta', subtitle: 'Panadería Martín', place: 'Sevilla', text: '- Atención y consejo a los clientes\n- Manejo de la caja' },
      education: { title: 'Grado medio en comercio', subtitle: 'IES Miguel de Cervantes', place: 'Sevilla', text: '' },
      skills: { title: 'Habilidades personales, Herramientas, Idiomas…', text: 'Trato con el cliente, Excel, puntualidad' },
      languages: { title: 'Inglés', text: 'Avanzado' },
      interests: { title: 'Senderismo' },
    },
  },
  de: {
    jobTitle: 'Verkäuferin',
    kinds: {
      profile: { text: 'Freundliche, organisierte Verkäuferin mit Freude am Kundenkontakt.' },
      experience: { title: 'Verkäuferin', subtitle: 'Bäckerei Martin', place: 'Köln', text: '- Kunden begrüßt und beraten\n- Kasse geführt' },
      education: { title: 'Ausbildung im Einzelhandel', subtitle: 'Berufskolleg Mitte', place: 'Köln', text: '' },
      skills: { title: 'Soziale Kompetenzen, Werkzeuge, Sprachen…', text: 'Kundenorientierung, Excel, Pünktlichkeit' },
      languages: { title: 'Englisch', text: 'Fließend' },
      interests: { title: 'Wandern' },
    },
  },
  it: {
    jobTitle: 'Commessa',
    kinds: {
      profile: { text: 'Commessa cordiale e organizzata, a suo agio con il pubblico.' },
      experience: { title: 'Commessa', subtitle: 'Panificio Martini', place: 'Bologna', text: '- Accoglienza e consulenza ai clienti\n- Gestione della cassa' },
      education: { title: 'Diploma in commercio', subtitle: 'Istituto Tecnico Leonardo da Vinci', place: 'Bologna', text: '' },
      skills: { title: 'Competenze trasversali, Strumenti, Lingue…', text: 'Relazione con il cliente, Excel, puntualità' },
      languages: { title: 'Inglese', text: 'Fluente' },
      interests: { title: 'Escursionismo' },
    },
  },
  pt: {
    jobTitle: 'Vendedora',
    kinds: {
      profile: { text: 'Vendedora simpática e organizada, à vontade no contacto com o público.' },
      experience: { title: 'Vendedora', subtitle: 'Padaria Martins', place: 'Porto', text: '- Atendimento e aconselhamento de clientes\n- Gestão da caixa' },
      education: { title: 'Curso profissional de comércio', subtitle: 'Escola Secundária Camilo Castelo Branco', place: 'Porto', text: '' },
      skills: { title: 'Competências pessoais, Ferramentas, Línguas…', text: 'Trato com o cliente, Excel, pontualidade' },
      languages: { title: 'Inglês', text: 'Fluente' },
      interests: { title: 'Caminhadas' },
    },
  },
  ar: {
    jobTitle: 'بائعة',
    kinds: {
      profile: { text: 'بائعة لبقة ومنظمة، ترتاح في التعامل مع الزبائن.' },
      experience: { title: 'بائعة', subtitle: 'مخبزة الأمل', place: 'الرباط', text: '- استقبال الزبائن وإرشادهم\n- إدارة الصندوق' },
      education: { title: 'دبلوم في التجارة', subtitle: 'معهد التكنولوجيا التطبيقية', place: 'الرباط', text: '' },
      skills: { title: 'مهارات شخصية، أدوات، لغات…', text: 'التواصل مع الزبائن، إكسل، الالتزام بالمواعيد' },
      languages: { title: 'الإنجليزية', text: 'جيد جدًا' },
      interests: { title: 'المشي في الطبيعة' },
    },
  },
}
