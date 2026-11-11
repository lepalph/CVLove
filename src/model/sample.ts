import { emptyCV, newField, uid } from './cv'
import { letterFromCV } from './letter'
import { firstContent, retailContent } from './sampleProfiles'
import { newSections } from '../i18n/newSections'
import { NEW_KINDS, type CV, type Item, type Lang, type Letter, type SectionKind } from './types'

/** Données d'exemple, fictives. Le contenu est celui de la langue (fr, en, ar) ; les autres langues reprennent l'anglais. */
type Row = Partial<Omit<Item, 'id'>>
export interface Content {
  firstName: string; lastName: string; title: string
  fields: [string, string, string, string] // lieu, e-mail, téléphone, site (pas de date de naissance : déconseillée en France)
  sections: [SectionKind, Row[], string?][] // 3e valeur : titre d'une section libre
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
    ['languages', [{ title: 'Français', text: '', cefr: 'native' }, { title: 'Anglais', text: '', cefr: 'C1' }, { title: 'Espagnol', text: '', cefr: 'B1' }]],
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
    ['languages', [{ title: 'French', text: '', cefr: 'native' }, { title: 'English', text: '', cefr: 'C1' }, { title: 'Spanish', text: '', cefr: 'B1' }]],
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
    ['languages', [{ title: 'العربية', text: '', cefr: 'native' }, { title: 'الفرنسية', text: '', cefr: 'C2' }, { title: 'الإنجليزية', text: '', cefr: 'C1' }]],
    ['interests', [{ title: 'التصوير' }, { title: 'تسلق الجبال' }, { title: 'الطبخ' }]],
  ],
}

const contents: Partial<Record<Lang, Content>> = { fr, en, ar }

/** Contrôles (check:pdf, tests) : ajoute bénévolat, certifications et publications, remplis avec les exemples gris de la langue du CV. */
export const withNewSections = (cv: CV): CV => ({
  ...cv,
  sections: [...cv.sections, ...NEW_KINDS.map((kind) => ({ id: uid(), kind, title: '', visible: true, items: [it({ ...newSections[cv.lang].ph[kind], start: '2021-03' })] }))],
})

export type SampleProfile = 'retail' | 'first' | 'dev'
export const SAMPLE_PROFILES: readonly SampleProfile[] = ['retail', 'first', 'dev']

/** Exemple d'un profil : vente et accueil (par défaut), premier emploi, informatique (Camille). */
export function sampleCV(lang: Lang, profile: SampleProfile = 'retail'): CV {
  const c = profile === 'retail' ? retailContent(lang) : profile === 'first' ? firstContent(lang) : contents[lang] ?? en
  const cv = emptyCV(lang)
  cv.personal = {
    ...cv.personal, firstName: c.firstName, lastName: c.lastName, title: c.title,
    fields: (['location', 'email', 'phone', 'website'] as const).flatMap((k, i) => (c.fields[i] ? [newField(k, c.fields[i])] : [])),
  }
  cv.sections = c.sections.map(([kind, rows, title]) => ({ id: uid(), kind, title: title ?? '', visible: true, items: rows.map(it) }))
  return cv
}

interface LetterContent { recipient: [string, string, string]; subject: string; body: string }

const devLetters: Record<Lang, LetterContent> = {
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

const retailLetters: Record<Lang, LetterContent> = {
  fr: {
    recipient: ['Madame Lambert', 'Boutique Aurore', '8 rue de la République\n69001 Lyon'],
    subject: 'Candidature au poste de conseillère de vente',
    body: "Votre annonce pour un poste de conseillère de vente m'a tout de suite intéressée. Depuis huit ans, je travaille en boulangerie, en supermarché et en boutique de prêt-à-porter, et j'aime le contact avec les clients.\n\nChez Maison Duval, j'accueille et je conseille une quarantaine de clients par jour, je tiens la caisse et je la clôture chaque soir sans écart. Je prends aussi plaisir à garder un magasin rangé et bien approvisionné.\n\nJe serais heureuse de vous rencontrer pour vous parler de mon parcours. Je reste disponible à votre convenance.",
  },
  en: {
    recipient: ['Ms Lambert', 'Aurora Boutique', '8 Park Street\nBristol BS1 5JG'],
    subject: 'Application for the sales assistant position',
    body: "Your advert for a sales assistant immediately caught my interest. For eight years I have worked in a bakery, a supermarket and a fashion store, and I enjoy dealing with customers.\n\nAt Duval & Co I welcome and advise about forty customers a day, run the till and balance it every evening. I also take pride in keeping a store tidy and well stocked.\n\nI would be pleased to meet you and tell you more about my background. I am available whenever suits you.",
  },
  es: {
    recipient: ['Sra. Lambert', 'Boutique Aurora', 'Calle de la Paz 8\n46003 Valencia'],
    subject: 'Candidatura al puesto de dependienta',
    body: "Su oferta de dependienta me ha interesado enseguida. Desde hace ocho años trabajo en panadería, supermercado y tiendas de moda, y disfruto del trato con los clientes.\n\nEn Moda Duval atiendo y aconsejo a unos cuarenta clientes al día, llevo la caja y la cierro cada tarde sin descuadres. También me gusta mantener la tienda ordenada y bien surtida.\n\nMe alegraría poder reunirme con usted para hablarle de mi trayectoria. Quedo a su disposición.",
  },
  de: {
    recipient: ['Frau Lambert', 'Boutique Aurora', 'Gartenstraße 8\n80331 München'],
    subject: 'Bewerbung als Verkäuferin',
    body: "Ihre Anzeige für eine Verkäuferin hat sofort mein Interesse geweckt. Seit acht Jahren arbeite ich in einer Bäckerei, einem Supermarkt und einem Modegeschäft und schätze den Kontakt zu Kunden.\n\nBei Duval Mode berate ich täglich etwa vierzig Kunden, führe die Kasse und schließe sie jeden Abend ohne Differenz ab. Außerdem halte ich gern das Geschäft ordentlich und gut aufgefüllt.\n\nÜber ein Treffen, bei dem ich Ihnen meinen Werdegang schildern kann, freue ich mich sehr. Ich stehe Ihnen jederzeit zur Verfügung.",
  },
  it: {
    recipient: ['Gentile Signora Lambert', 'Boutique Aurora', 'Via della Pace 8\n10121 Torino'],
    subject: 'Candidatura per la posizione di commessa',
    body: "Il vostro annuncio per una commessa ha subito suscitato il mio interesse. Da otto anni lavoro in panetteria, al supermercato e in negozi di abbigliamento, e mi piace il contatto con i clienti.\n\nDa Moda Duval accolgo e consiglio circa quaranta clienti al giorno, gestisco la cassa e la chiudo ogni sera senza differenze. Mi piace anche tenere il negozio in ordine e ben rifornito.\n\nSarei lieta di incontrarvi per parlarvi del mio percorso. Resto a vostra disposizione.",
  },
  pt: {
    recipient: ['Exma. Sra. Lambert', 'Boutique Aurora', 'Rua da Paz 8\n4000-001 Porto'],
    subject: 'Candidatura ao lugar de vendedora',
    body: "O vosso anúncio para vendedora despertou-me logo o interesse. Há oito anos que trabalho em padaria, supermercado e lojas de moda, e gosto do contacto com os clientes.\n\nNa Moda Duval atendo e aconselho cerca de quarenta clientes por dia, trabalho na caixa e fecho-a todas as noites sem diferenças. Também gosto de manter a loja arrumada e bem abastecida.\n\nFicaria satisfeita por me encontrar convosco para falar do meu percurso. Fico ao dispor.",
  },
  ar: {
    recipient: ['السيدة لمبرت', 'بوتيك الفجر', 'شارع السلام 8\nالدار البيضاء'],
    subject: 'طلب توظيف: بائعة ومستشارة مبيعات',
    body: 'لفت إعلانكم عن وظيفة بائعة ومستشارة مبيعات انتباهي فورًا. أعمل منذ ثماني سنوات في مخبز وسوبرماركت ومتجر ملابس، وأحب التعامل مع الزبائن.\n\nفي متجر الأزياء الذي أعمل فيه أستقبل وأنصح نحو أربعين زبونًا يوميًا، وأتولى الصندوق وأغلقه كل مساء دون أي فارق. كما أحب أن يبقى المتجر مرتبًا وممتلئًا بالبضائع.\n\nيسعدني أن ألتقي بكم وأحدثكم عن مساري. وأنا رهن إشارتكم.',
  },
}

const firstLetters: Record<Lang, LetterContent> = {
  fr: {
    recipient: ['Monsieur Lefèvre', 'Café des Halles', '5 place du Commerce\n44000 Nantes'],
    subject: 'Candidature pour un emploi à temps partiel',
    body: "Votre annonce pour un poste de serveur à temps partiel m'a intéressé. Je suis étudiant en première année de licence et je cherche un emploi que je peux concilier avec mes cours.\n\nJ'ai déjà gardé des enfants chaque semaine, travaillé l'été dans un camping et sur un marché, où j'accueillais les clients et tenais la caisse. Je suis ponctuel, sérieux et j'aime le travail en équipe.\n\nJe serais content de vous rencontrer pour vous en parler. Je reste disponible à votre convenance.",
  },
  en: {
    recipient: ['Mr Lefevre', 'Market Café', '5 Commerce Square\nLeeds LS1 4AP'],
    subject: 'Application for a part-time job',
    body: "Your advert for a part-time waiter caught my interest. I am a first-year university student and I am looking for a job that fits around my classes.\n\nI have looked after children every week and worked summers at a campsite and on a market stall, where I welcomed customers and ran the till. I am punctual, reliable and enjoy working in a team.\n\nI would be glad to meet you to talk about it. I am available whenever suits you.",
  },
  es: {
    recipient: ['Sr. Lefèvre', 'Café del Mercado', 'Plaza del Comercio 5\n46001 Valencia'],
    subject: 'Candidatura a un empleo a tiempo parcial',
    body: "Su oferta de camarero a tiempo parcial me ha interesado. Soy estudiante de primer curso de grado y busco un empleo que pueda compaginar con las clases.\n\nHe cuidado niños cada semana y he trabajado en verano en un camping y en un mercado, donde atendía a los clientes y llevaba la caja. Soy puntual, responsable y me gusta trabajar en equipo.\n\nMe encantaría reunirme con usted para hablarlo. Quedo a su disposición.",
  },
  de: {
    recipient: ['Herr Lefèvre', 'Café am Markt', 'Marktplatz 5\n04109 Leipzig'],
    subject: 'Bewerbung um eine Teilzeitstelle',
    body: "Ihre Anzeige für eine Servicekraft in Teilzeit hat mich angesprochen. Ich bin Student im ersten Semester und suche eine Stelle, die sich mit meinem Studium vereinbaren lässt.\n\nIch habe regelmäßig Kinder betreut und in den Sommerferien auf einem Campingplatz und auf einem Markt gearbeitet, wo ich Kunden bedient und die Kasse geführt habe. Ich bin pünktlich, zuverlässig und arbeite gern im Team.\n\nÜber ein Gespräch freue ich mich. Ich stehe Ihnen jederzeit zur Verfügung.",
  },
  it: {
    recipient: ['Gentile Signor Lefèvre', 'Caffè del Mercato', 'Piazza del Commercio 5\n40121 Bologna'],
    subject: 'Candidatura per un lavoro part-time',
    body: "Il vostro annuncio per un cameriere part-time mi ha interessato. Sono uno studente del primo anno di università e cerco un lavoro conciliabile con le lezioni.\n\nHo badato ai bambini ogni settimana e ho lavorato d'estate in un campeggio e in un mercato, dove accoglievo i clienti e tenevo la cassa. Sono puntuale, serio e mi piace lavorare in squadra.\n\nSarei contento di incontrarvi per parlarne. Resto a vostra disposizione.",
  },
  pt: {
    recipient: ['Exmo. Sr. Lefèvre', 'Café do Mercado', 'Praça do Comércio 5\n4000-002 Porto'],
    subject: 'Candidatura a um emprego a tempo parcial',
    body: "O vosso anúncio para empregado de mesa a tempo parcial interessou-me. Sou estudante do 1.º ano de licenciatura e procuro um emprego compatível com as aulas.\n\nJá cuidei de crianças todas as semanas e trabalhei no verão num parque de campismo e num mercado, onde atendia os clientes e tratava da caixa. Sou pontual, responsável e gosto de trabalhar em equipa.\n\nFicaria contente por me encontrar convosco para falar sobre isto. Fico ao dispor.",
  },
  ar: {
    recipient: ['السيد الفاسي', 'مقهى السوق', 'ساحة التجارة 5\nالدار البيضاء'],
    subject: 'طلب توظيف بدوام جزئي',
    body: 'لفت إعلانكم عن وظيفة نادل بدوام جزئي انتباهي. أنا طالب في السنة الأولى الجامعية وأبحث عن عمل يتناسب مع أوقات دراستي.\n\nاعتنيت بالأطفال كل أسبوع، وعملت في الصيف في مخيم وفي سوق، حيث كنت أستقبل الزبائن وأتولى الصندوق. أنا ملتزم بالمواعيد وجاد، وأحب العمل ضمن فريق.\n\nيسعدني أن ألتقي بكم للحديث عن ذلك. وأنا رهن إشارتكم.',
  },
}

const letters = { retail: retailLetters, first: firstLetters, dev: devLetters }

/** Lettre d'exemple, cohérente avec `sampleCV(lang, profile)` : expéditeur repris du CV d'exemple, destinataire fictif. */
export function sampleLetter(lang: Lang, profile: SampleProfile = 'retail'): Letter {
  const c = letters[profile][lang]
  return { ...letterFromCV(sampleCV(lang, profile)), recipient: { name: c.recipient[0], company: c.recipient[1], address: c.recipient[2] }, subject: c.subject, body: c.body }
}
