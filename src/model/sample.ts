import { emptyCV, newField, uid } from './cv'
import { letterFromCV } from './letter'
import type { CV, Item, Lang, Letter, SectionKind } from './types'

/** Données d'exemple, fictives. Le contenu est celui de la langue (fr, en, ar) ; les autres langues reprennent l'anglais. */
type Row = Partial<Omit<Item, 'id'>>
interface Content {
  firstName: string; lastName: string; title: string
  fields: [string, string, string, string] // lieu, e-mail, téléphone, site (pas de date de naissance : déconseillée en France)
  sections: [SectionKind, Row[]][]
}

const it = (r: Row): Item => ({ id: uid(), title: '', subtitle: '', place: '', start: '', end: '', current: false, text: '', ...r })

const fr: Content = {
  firstName: 'Camille', lastName: 'Marchand', title: 'Développeuse web full-stack',
  fields: ['Lyon, France', 'camille.marchand@exemple.fr', '+33 6 12 34 56 78', 'camille-marchand.exemple.fr'],
  sections: [
    ['profile', [{ text: "Développeuse full-stack avec 6 ans d'expérience sur des produits web grand public. J'aime les interfaces claires, le code qu'on relit sans effort et les équipes qui livrent souvent." }]],
    ['experience', [
      { title: 'Développeuse full-stack senior', subtitle: 'Atelier Lumen', place: 'Lyon', start: '2021-03', current: true, text: "- Refonte du tunnel de commande : +18 % de conversion\n- Migration de l'API vers TypeScript et Node, couverture de tests passée de 20 % à 80 %\n- Encadrement de deux développeurs juniors" },
      { title: 'Développeuse front-end', subtitle: 'Studio Pivoine', place: 'Villeurbanne', start: '2018-09', end: '2021-02', text: "- Création d'une bibliothèque de composants React utilisée par 5 produits\n- Amélioration des performances : LCP divisé par deux" },
    ]],
    ['education', [
      { title: "Master Informatique, parcours génie logiciel", subtitle: 'Université Claude-Bernard Lyon 1', start: '2016-09', end: '2018-06' },
      { title: 'Licence Informatique', subtitle: 'Université Claude-Bernard Lyon 1', start: '2013-09', end: '2016-06' },
    ]],
    ['skills', [
      { title: 'Front-end', text: 'React, TypeScript, Tailwind CSS, accessibilité', level: 5 },
      { title: 'Back-end', text: 'Node.js, PostgreSQL, API REST', level: 4 },
      { title: 'Outils', text: 'Git, Docker, CI/CD, Playwright', level: 4 },
    ]],
    ['languages', [{ title: 'Français', text: 'Langue maternelle', level: 5 }, { title: 'Anglais', text: 'Courant (C1)', level: 4 }, { title: 'Espagnol', text: 'Intermédiaire (B1)', level: 3 }]],
    ['projects', [{ title: 'Potager partagé', subtitle: 'Application open source', start: '2022-01', text: "Application web pour organiser les arrosages d'un jardin collectif ; 300 utilisateurs actifs." }]],
    ['interests', [{ title: 'Escalade' }, { title: 'Photographie argentique' }, { title: 'Cuisine japonaise' }]],
  ],
}

const en: Content = {
  firstName: 'Camille', lastName: 'Marchand', title: 'Full-stack web developer',
  fields: ['Lyon, France', 'camille.marchand@example.com', '+33 6 12 34 56 78', 'camille-marchand.example.com'],
  sections: [
    ['profile', [{ text: 'Full-stack developer with 6 years of experience building consumer web products. I like clear interfaces, code that reads easily and teams that ship often.' }]],
    ['experience', [
      { title: 'Senior full-stack developer', subtitle: 'Atelier Lumen', place: 'Lyon', start: '2021-03', current: true, text: '- Rebuilt the checkout flow: +18% conversion\n- Migrated the API to TypeScript and Node, test coverage from 20% to 80%\n- Mentored two junior developers' },
      { title: 'Front-end developer', subtitle: 'Studio Pivoine', place: 'Villeurbanne', start: '2018-09', end: '2021-02', text: '- Built a React component library used by 5 products\n- Performance work: LCP cut in half' },
    ]],
    ['education', [
      { title: 'MSc Computer Science, software engineering track', subtitle: 'Claude Bernard University Lyon 1', start: '2016-09', end: '2018-06' },
      { title: 'BSc Computer Science', subtitle: 'Claude Bernard University Lyon 1', start: '2013-09', end: '2016-06' },
    ]],
    ['skills', [
      { title: 'Front-end', text: 'React, TypeScript, Tailwind CSS, accessibility', level: 5 },
      { title: 'Back-end', text: 'Node.js, PostgreSQL, REST APIs', level: 4 },
      { title: 'Tools', text: 'Git, Docker, CI/CD, Playwright', level: 4 },
    ]],
    ['languages', [{ title: 'French', text: 'Native', level: 5 }, { title: 'English', text: 'Fluent (C1)', level: 4 }, { title: 'Spanish', text: 'Intermediate (B1)', level: 3 }]],
    ['projects', [{ title: 'Shared Vegetable Garden', subtitle: 'Open-source app', start: '2022-01', text: 'Web app to schedule watering in a community garden; 300 active users.' }]],
    ['interests', [{ title: 'Climbing' }, { title: 'Film photography' }, { title: 'Japanese cooking' }]],
  ],
}

// Texte arabe avec voyelles brèves (tashkeel) pour vérifier le placement des diacritiques dans le PDF.
const ar: Content = {
  firstName: 'ليلى', lastName: 'الحداد', title: 'مُطَوِّرة ويب متكاملة',
  fields: ['الدار البيضاء، المغرب', 'laila.haddad@example.com', '+212 6 12 34 56 78', 'laila-haddad.example.com'],
  sections: [
    ['profile', [{ text: 'مُطَوِّرة ويب بخبرة ست سنوات في بناء منتجات رقمية للجمهور. أُحِبُّ الواجهات الواضحة والشيفرة السهلة القراءة والفرق التي تُنجِز بانتظام.' }]],
    ['experience', [
      { title: 'مطورة ويب أولى', subtitle: 'شركة نور للبرمجيات', place: 'الدار البيضاء', start: '2021-03', current: true, text: '- إعادة تصميم مسار الشراء مع زيادة التحويل بنسبة 18٪\n- ترحيل واجهة البرمجة إلى TypeScript و Node\n- تدريب مطورَيْن مبتدئَيْن' },
      { title: 'مطورة واجهات أمامية', subtitle: 'استوديو الياسمين', place: 'الرباط', start: '2018-09', end: '2021-02', text: '- بناء مكتبة مكونات React تستخدمها خمسة منتجات\n- تحسين الأداء وتقليص زمن التحميل إلى النصف' },
    ]],
    ['education', [{ title: 'ماجستير في علوم الحاسوب', subtitle: 'جامعة محمد الخامس', start: '2016-09', end: '2018-06' }]],
    ['skills', [{ title: 'الواجهات الأمامية', text: 'React, TypeScript, Tailwind CSS', level: 5 }, { title: 'الخلفية', text: 'Node.js, PostgreSQL', level: 4 }]],
    ['languages', [{ title: 'العربية', text: 'اللغة الأم', level: 5 }, { title: 'الفرنسية', text: 'طلاقة', level: 5 }, { title: 'الإنجليزية', text: 'جيد جدًا', level: 4 }]],
    ['interests', [{ title: 'التصوير' }, { title: 'تسلق الجبال' }, { title: 'الطبخ' }]],
  ],
}

const contents: Partial<Record<Lang, Content>> = { fr, en, ar }

export function sampleCV(lang: Lang): CV {
  const c = contents[lang] ?? en
  const cv = emptyCV(lang)
  cv.personal = {
    ...cv.personal, firstName: c.firstName, lastName: c.lastName, title: c.title,
    fields: (['location', 'email', 'phone', 'website'] as const).map((k, i) => newField(k, c.fields[i])),
  }
  cv.sections = c.sections.map(([kind, rows]) => ({ id: uid(), kind, title: '', visible: true, items: rows.map(it) }))
  return cv
}

interface LetterContent { recipient: [string, string, string]; subject: string; body: string }

const letters: Record<Lang, LetterContent> = {
  fr: {
    recipient: ['Madame Durand', 'Studio Horizon', '14 rue des Tisserands\n69002 Lyon'],
    subject: 'Candidature au poste de développeuse full-stack',
    body: "Votre annonce pour un poste de développeuse full-stack a retenu toute mon attention. Depuis six ans, je conçois des produits web grand public, et j'aimerais mettre cette expérience au service de votre équipe.\n\nChez Atelier Lumen, j'ai refondu le tunnel de commande, ce qui a fait progresser la conversion de 18 %, et j'ai accompagné deux développeurs juniors. J'y ai pris goût au code clair et aux livraisons fréquentes.\n\nJe serais ravie de vous présenter mon parcours lors d'un échange. Je reste disponible à votre convenance.",
  },
  en: {
    recipient: ['Ms Durand', 'Horizon Studio', '14 Weavers Lane\nLondon N1 5AB'],
    subject: 'Application for the full-stack developer position',
    body: "Your advert for a full-stack developer caught my attention. For six years I have been building consumer web products, and I would like to put that experience to work for your team.\n\nAt Atelier Lumen I rebuilt the checkout flow, which raised conversion by 18%, and I mentored two junior developers. I have come to value clear code and frequent releases.\n\nI would be glad to talk through my background with you. I am available whenever suits you.",
  },
  es: {
    recipient: ['Sra. Durand', 'Estudio Horizonte', 'Calle de los Tejedores 14\n28012 Madrid'],
    subject: 'Candidatura al puesto de desarrolladora full-stack',
    body: "Su oferta de desarrolladora full-stack me ha llamado mucho la atención. Desde hace seis años creo productos web para el gran público y me gustaría aportar esa experiencia a su equipo.\n\nEn Atelier Lumen rediseñé el proceso de compra, lo que aumentó la conversión un 18 %, y acompañé a dos desarrolladores junior. Allí aprendí a valorar el código claro y las entregas frecuentes.\n\nMe encantaría contarle mi trayectoria en una entrevista. Quedo a su disposición.",
  },
  de: {
    recipient: ['Frau Durand', 'Studio Horizont', 'Webergasse 14\n50667 Köln'],
    subject: 'Bewerbung als Full-Stack-Entwicklerin',
    body: "Ihre Anzeige für eine Full-Stack-Entwicklerin hat mich sofort angesprochen. Seit sechs Jahren entwickle ich Webprodukte für ein breites Publikum und möchte diese Erfahrung gern in Ihr Team einbringen.\n\nBei Atelier Lumen habe ich den Bestellprozess neu gestaltet, wodurch die Conversion um 18 % stieg, und zwei Nachwuchsentwickler betreut. Dabei habe ich klaren Code und häufige Releases schätzen gelernt.\n\nÜber ein persönliches Gespräch freue ich mich sehr und stehe Ihnen gern jederzeit zur Verfügung.",
  },
  it: {
    recipient: ['Gentile Dott.ssa Durand', 'Studio Orizzonte', 'Via dei Tessitori 14\n40121 Bologna'],
    subject: 'Candidatura per la posizione di sviluppatrice full-stack',
    body: "Il vostro annuncio per una sviluppatrice full-stack ha catturato subito la mia attenzione. Da sei anni realizzo prodotti web per il grande pubblico e vorrei mettere questa esperienza al servizio del vostro team.\n\nPresso Atelier Lumen ho riprogettato il processo di acquisto, con un aumento delle conversioni del 18 %, e ho affiancato due sviluppatori junior. Ho imparato ad apprezzare il codice chiaro e i rilasci frequenti.\n\nSarei lieta di presentarvi il mio percorso in un colloquio. Resto a vostra disposizione.",
  },
  pt: {
    recipient: ['Exma. Sra. Durand', 'Estúdio Horizonte', 'Rua dos Tecelões 14\n4050-001 Porto'],
    subject: 'Candidatura ao lugar de programadora full-stack',
    body: "O vosso anúncio para programadora full-stack despertou-me logo o interesse. Há seis anos que crio produtos web para o grande público e gostaria de pôr essa experiência ao serviço da vossa equipa.\n\nNa Atelier Lumen redesenhei o processo de compra, o que fez a conversão subir 18 %, e acompanhei dois programadores juniores. Aprendi a valorizar o código claro e as entregas frequentes.\n\nFicaria muito satisfeita por apresentar o meu percurso numa entrevista. Fico ao dispor.",
  },
  ar: {
    recipient: ['السيدة الحدادي', 'استوديو الأفق', 'شارع النسّاجين 14\nالدار البيضاء'],
    subject: 'طلب توظيف: مطورة ويب متكاملة',
    body: 'لفت إعلانكم عن وظيفة مطورة ويب متكاملة انتباهي. أعمل منذ ست سنوات على بناء منتجات ويب للجمهور، وأود أن أضع هذه الخبرة في خدمة فريقكم.\n\nفي شركة نور للبرمجيات أعدت تصميم مسار الشراء فارتفع التحويل بنسبة 18٪، ورافقت مطورَيْن مبتدئَيْن. تعلمت هناك تقدير الشيفرة الواضحة والتسليمات المتكررة.\n\nيسعدني أن أعرض عليكم مساري في مقابلة، وأنا رهن إشارتكم.',
  },
}

/** Lettre d'exemple, cohérente avec `sampleCV(lang)` : expéditeur repris du CV d'exemple, destinataire fictif. */
export function sampleLetter(lang: Lang): Letter {
  const c = letters[lang]
  return { ...letterFromCV(sampleCV(lang)), recipient: { name: c.recipient[0], company: c.recipient[1], address: c.recipient[2] }, subject: c.subject, body: c.body }
}
