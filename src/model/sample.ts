import { emptyCV, newField, uid } from './cv'
import type { CV, Item, Lang, SectionKind } from './types'

/** Données d'exemple, fictives. Le contenu est celui de la langue (fr, en, ar) ; les autres langues reprennent l'anglais. */
type Row = Partial<Omit<Item, 'id'>>
interface Content {
  firstName: string; lastName: string; title: string
  fields: [string, string, string, string, string] // naissance, lieu, e-mail, téléphone, site
  sections: [SectionKind, Row[]][]
}

const it = (r: Row): Item => ({ id: uid(), title: '', subtitle: '', place: '', start: '', end: '', current: false, text: '', ...r })

const fr: Content = {
  firstName: 'Camille', lastName: 'Marchand', title: 'Développeuse web full-stack',
  fields: ['1994-06-12', 'Lyon, France', 'camille.marchand@exemple.fr', '+33 6 12 34 56 78', 'camille-marchand.exemple.fr'],
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
  fields: ['1994-06-12', 'Lyon, France', 'camille.marchand@example.com', '+33 6 12 34 56 78', 'camille-marchand.example.com'],
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
  fields: ['1994-06-12', 'الدار البيضاء، المغرب', 'laila.haddad@example.com', '+212 6 12 34 56 78', 'laila-haddad.example.com'],
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
    fields: (['birthDate', 'location', 'email', 'phone', 'website'] as const).map((k, i) => newField(k, c.fields[i])),
  }
  cv.sections = c.sections.map(([kind, rows]) => ({ id: uid(), kind, title: '', visible: true, items: rows.map(it) }))
  return cv
}
