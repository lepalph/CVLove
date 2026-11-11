import type { Content } from './sample'

/** Profils « Vente et accueil » et « Premier emploi » : textes par langue, dates et niveaux communs. Données fictives, sans date de naissance. */
type Tx = {
  first: string; last: string; title: string
  fields: [string, string, string, string] // lieu, e-mail, téléphone, site ('' = pas de champ)
  profile: string
  exp: [string, string, string, string][] // poste, employeur, lieu, missions
  edu: [string, string][]
  skills: [string, string][]
  langs: [string, string][]
  custom?: { title: string; rows: [string, string, string, string][] } // section libre (bénévolat)
  ints: string[]
}

const build = (x: Tx, d: { exp: [string, string, boolean?][]; edu: [string, string][]; skills: number[]; langs: number[]; custom?: [string, string][] }): Content => ({
  firstName: x.first, lastName: x.last, title: x.title, fields: x.fields,
  sections: [
    ['profile', [{ text: x.profile }]],
    ['experience', x.exp.map(([title, subtitle, place, text], i) => ({ title, subtitle, place, text, start: d.exp[i][0], end: d.exp[i][1], current: !!d.exp[i][2] }))],
    ['education', x.edu.map(([title, subtitle], i) => ({ title, subtitle, start: d.edu[i][0], end: d.edu[i][1] }))],
    ['skills', x.skills.map(([title, text], i) => ({ title, text, level: d.skills[i] }))],
    ['languages', x.langs.map(([title, text], i) => ({ title, text, cefr: ({ 5: 'native', 4: 'B2', 2: 'A2' } as const)[d.langs[i] as 5 | 4 | 2] }))],
    ...(x.custom ? [['custom', x.custom.rows.map(([title, subtitle, place, text], i) => ({ title, subtitle, place, text, start: d.custom![i][0], end: d.custom![i][1] })), x.custom.title] as Content['sections'][number]] : []),
    ['interests', x.ints.map((title) => ({ title }))],
  ],
})

const retailD = {
  exp: [['2021-05', '', true], ['2018-09', '2021-04'], ['2016-09', '2018-08']] as [string, string, boolean?][],
  edu: [['2013-09', '2016-06'], ['2011-09', '2013-06']] as [string, string][],
  skills: [5, 5, 4], langs: [5, 2],
}
const firstD = {
  exp: [['2022-09', '', true], ['2025-07', '2025-08'], ['2024-07', '2024-08']] as [string, string, boolean?][],
  edu: [['2024-09', ''], ['2021-09', '2024-06']] as [string, string][],
  skills: [5, 4, 4], langs: [5, 4, 2], custom: [['2023-10', '2024-06']] as [string, string][],
}

const retail: Record<string, Tx> = {
  fr: {
    first: 'Nadia', last: 'Perrin', title: 'Conseillère de vente',
    fields: ['Lyon, France', 'nadia.perrin@exemple.fr', '+33 6 98 76 54 32', ''],
    profile: "Conseillère de vente avec 8 ans d'expérience en boulangerie, grande distribution et prêt-à-porter. À l'aise à l'accueil comme en caisse, j'aime conseiller les clients et tenir un magasin rangé et bien approvisionné.",
    exp: [
      ['Conseillère de vente', 'Maison Duval, prêt-à-porter', 'Lyon', "- Accueil et conseil d'environ 40 clients par jour\n- Tenue de la caisse et clôture quotidienne sans écart\n- Mise en rayon et réassort de la collection"],
      ['Vendeuse', 'Boulangerie Martin', 'Villeurbanne', "- Vente au comptoir et prise de commandes pour les événements\n- Formation de deux nouvelles recrues\n- Suivi des stocks de viennoiserie"],
      ['Hôtesse de caisse', 'Supermarché Primeur', 'Bron', "- Encaissement et relation client aux heures de pointe\n- Contrôle des prix et rangement des rayons"],
    ],
    edu: [['Bac pro Métiers du commerce et de la vente', 'Lycée Jean-Moulin'], ['CAP Équipier polyvalent du commerce', 'Lycée professionnel Les Canuts']],
    skills: [['Relation client', 'Accueil, écoute, conseil, vente additionnelle'], ['Caisse', 'Encaissement, clôture, gestion des litiges'], ['Magasin', 'Mise en rayon, inventaire, réassort']],
    langs: [['Français', 'Langue maternelle'], ['Anglais', 'Notions (A2)']],
    ints: ['Couture', 'Randonnée', 'Cuisine'],
  },
  en: {
    first: 'Nadia', last: 'Perrin', title: 'Sales assistant',
    fields: ['Bristol, UK', 'nadia.perrin@example.com', '+44 7700 900123', ''],
    profile: 'Sales assistant with 8 years of experience in a bakery, a supermarket and a fashion store. Equally at ease on the shop floor and at the till, I enjoy advising customers and keeping a store tidy and well stocked.',
    exp: [
      ['Sales assistant', 'Duval & Co, fashion', 'Bristol', '- Welcomed and advised about 40 customers a day\n- Ran the till and balanced it every evening\n- Stocked shelves and set out the new collection'],
      ['Shop assistant', 'Martin’s Bakery', 'Bath', '- Served at the counter and took orders for events\n- Trained two new colleagues\n- Tracked pastry stock'],
      ['Cashier', 'Primeur Supermarket', 'Bristol', '- Handled payments and customers at peak times\n- Checked prices and tidied aisles'],
    ],
    edu: [['Level 3 Diploma in Retail', 'Bristol City College'], ['Level 2 Certificate in Retail Skills', 'Bristol City College']],
    skills: [['Customer service', 'Welcoming, listening, advising, upselling'], ['Till', 'Payments, closing, handling complaints'], ['Store work', 'Stocking, stock counts, replenishment']],
    langs: [['English', 'Native'], ['French', 'Basic (A2)']],
    ints: ['Sewing', 'Hiking', 'Cooking'],
  },
  es: {
    first: 'Nadia', last: 'Perrin', title: 'Dependienta',
    fields: ['Valencia, España', 'nadia.perrin@ejemplo.es', '+34 612 345 678', ''],
    profile: 'Dependienta con 8 años de experiencia en panadería, supermercado y moda. Me desenvuelvo igual de bien en sala que en caja, y me gusta asesorar a los clientes y mantener la tienda ordenada y bien surtida.',
    exp: [
      ['Dependienta', 'Moda Duval', 'Valencia', '- Atención y asesoramiento a unos 40 clientes al día\n- Manejo de caja y cierre diario sin descuadres\n- Colocación y reposición de la colección'],
      ['Vendedora', 'Panadería Martín', 'Paterna', '- Venta en mostrador y pedidos para eventos\n- Formación de dos compañeras nuevas\n- Control del stock de bollería'],
      ['Cajera', 'Supermercado Primeur', 'Valencia', '- Cobro y atención al cliente en horas punta\n- Control de precios y orden de los pasillos'],
    ],
    edu: [['FP Grado Medio en Actividades Comerciales', 'IES Benlliure'], ['FP Básica en Servicios Comerciales', 'IES Benlliure']],
    skills: [['Atención al cliente', 'Acogida, escucha, asesoramiento, venta cruzada'], ['Caja', 'Cobros, cierre, gestión de reclamaciones'], ['Tienda', 'Colocación, inventario, reposición']],
    langs: [['Español', 'Lengua materna'], ['Inglés', 'Nociones (A2)']],
    ints: ['Costura', 'Senderismo', 'Cocina'],
  },
  de: {
    first: 'Nadia', last: 'Perrin', title: 'Verkäuferin',
    fields: ['Köln, Deutschland', 'nadia.perrin@beispiel.de', '+49 151 23456789', ''],
    profile: 'Verkäuferin mit 8 Jahren Erfahrung in Bäckerei, Supermarkt und Modehandel. Ich fühle mich im Verkaufsraum wie an der Kasse wohl, berate gern und halte ein Geschäft ordentlich und gut bestückt.',
    exp: [
      ['Verkäuferin', 'Modehaus Duval', 'Köln', '- Beratung von rund 40 Kundinnen und Kunden pro Tag\n- Kassenführung und täglicher Kassenabschluss ohne Differenzen\n- Warenpräsentation und Nachbestückung der Kollektion'],
      ['Verkäuferin', 'Bäckerei Martin', 'Bergisch Gladbach', '- Verkauf an der Theke und Annahme von Bestellungen für Feiern\n- Einarbeitung von zwei neuen Kolleginnen\n- Bestandskontrolle bei Feingebäck'],
      ['Kassiererin', 'Supermarkt Primeur', 'Köln', '- Kassieren und Kundenkontakt zu Stoßzeiten\n- Preiskontrolle und Regalpflege'],
    ],
    edu: [['Ausbildung zur Kauffrau im Einzelhandel', 'Berufskolleg Köln-Deutz'], ['Hauptschulabschluss', 'Gesamtschule Köln-Mülheim']],
    skills: [['Kundenservice', 'Empfang, Zuhören, Beratung, Zusatzverkauf'], ['Kasse', 'Kassieren, Abschluss, Reklamationen'], ['Laden', 'Regalpflege, Inventur, Nachbestückung']],
    langs: [['Deutsch', 'Muttersprache'], ['Englisch', 'Grundkenntnisse (A2)']],
    ints: ['Nähen', 'Wandern', 'Kochen'],
  },
  it: {
    first: 'Nadia', last: 'Perrin', title: 'Addetta alle vendite',
    fields: ['Bologna, Italia', 'nadia.perrin@esempio.it', '+39 331 234 5678', ''],
    profile: "Addetta alle vendite con 8 anni di esperienza in panetteria, supermercato e abbigliamento. Mi trovo a mio agio sia in negozio sia in cassa, mi piace consigliare i clienti e tenere il punto vendita in ordine e ben rifornito.",
    exp: [
      ['Addetta alle vendite', 'Moda Duval', 'Bologna', '- Accoglienza e consulenza a circa 40 clienti al giorno\n- Gestione della cassa e chiusura giornaliera senza differenze\n- Allestimento e rifornimento della collezione'],
      ['Commessa', 'Panetteria Martini', 'Casalecchio di Reno', '- Vendita al banco e ordini per le occasioni speciali\n- Affiancamento di due nuove colleghe\n- Controllo delle scorte di dolci'],
      ['Cassiera', 'Supermercato Primeur', 'Bologna', "- Incassi e rapporto con i clienti nelle ore di punta\n- Controllo dei prezzi e riordino degli scaffali"],
    ],
    edu: [['Diploma professionale, servizi commerciali', 'IPSSC Serpieri'], ['Qualifica professionale, operatore dei servizi di vendita', 'IPSSC Serpieri']],
    skills: [['Rapporto con i clienti', 'Accoglienza, ascolto, consulenza, vendita aggiuntiva'], ['Cassa', 'Incassi, chiusura, gestione dei reclami'], ['Negozio', 'Allestimento scaffali, inventario, rifornimento']],
    langs: [['Italiano', 'Madrelingua'], ['Inglese', 'Nozioni di base (A2)']],
    ints: ['Cucito', 'Escursionismo', 'Cucina'],
  },
  pt: {
    first: 'Nadia', last: 'Perrin', title: 'Assistente de vendas',
    fields: ['Porto, Portugal', 'nadia.perrin@exemplo.pt', '+351 912 345 678', ''],
    profile: 'Assistente de vendas com 8 anos de experiência em padaria, supermercado e moda. Sinto-me à vontade tanto na loja como na caixa, gosto de aconselhar os clientes e de manter a loja arrumada e bem abastecida.',
    exp: [
      ['Assistente de vendas', 'Moda Duval', 'Porto', '- Atendimento e aconselhamento de cerca de 40 clientes por dia\n- Gestão da caixa e fecho diário sem diferenças\n- Reposição e exposição da coleção'],
      ['Empregada de balcão', 'Padaria Martins', 'Gaia', '- Venda ao balcão e encomendas para eventos\n- Formação de duas novas colegas\n- Controlo do stock de pastelaria'],
      ['Operadora de caixa', 'Supermercado Primeur', 'Porto', '- Cobrança e atendimento nas horas de ponta\n- Verificação de preços e arrumação dos corredores'],
    ],
    edu: [['Curso Profissional de Técnico de Vendas', 'Escola Profissional de Gaia'], ['Curso de Educação e Formação, Comércio', 'Escola Secundária de Gaia']],
    skills: [['Atendimento ao cliente', 'Acolhimento, escuta, aconselhamento, venda adicional'], ['Caixa', 'Cobranças, fecho, gestão de reclamações'], ['Loja', 'Reposição, inventário, abastecimento']],
    langs: [['Português', 'Língua materna'], ['Inglês', 'Noções (A2)']],
    ints: ['Costura', 'Caminhadas', 'Culinária'],
  },
  ar: {
    first: 'سلمى', last: 'بنعلي', title: 'بائعة ومستشارة مبيعات',
    fields: ['الدار البيضاء، المغرب', 'salma.benali@example.com', '+212 6 61 23 45 67', ''],
    profile: 'بائعة بخبرة ثماني سنوات في المخبزة والسوبرماركت ومحلات الأزياء. أرتاح في استقبال الزبائن كما في الصندوق، وأحب تقديم النصح وإبقاء المتجر مرتبًا وممتلئًا بالبضائع.',
    exp: [
      ['مستشارة مبيعات', 'أزياء الأندلس', 'الدار البيضاء', '- استقبال ونصح نحو 40 زبونًا يوميًا\n- إدارة الصندوق وإقفاله يوميًا دون فروقات\n- ترتيب الرفوف وعرض المجموعة الجديدة'],
      ['بائعة', 'مخبزة الأمل', 'المحمدية', '- البيع على المنضدة وتلقي طلبات المناسبات\n- تدريب زميلتين جديدتين\n- متابعة مخزون الحلويات'],
      ['أمينة صندوق', 'سوبرماركت النخيل', 'الدار البيضاء', '- التحصيل وخدمة الزبائن في أوقات الذروة\n- مراقبة الأسعار وترتيب الأروقة'],
    ],
    edu: [['باكالوريا مهنية في التجارة والبيع', 'ثانوية الحسن الثاني'], ['شهادة التأهيل المهني في التجارة', 'معهد التكنولوجيا التطبيقية']],
    skills: [['خدمة الزبائن', 'الاستقبال والإصغاء والنصح والبيع الإضافي'], ['الصندوق', 'التحصيل والإقفال ومعالجة الشكاوى'], ['المتجر', 'ترتيب الرفوف والجرد وإعادة التموين']],
    langs: [['العربية', 'اللغة الأم'], ['الفرنسية', 'مستوى جيد']],
    ints: ['الخياطة', 'المشي في الجبال', 'الطبخ'],
  },
}

const first: Record<string, Tx> = {
  fr: {
    first: 'Lucas', last: 'Moreau', title: 'Étudiant en première année de licence',
    fields: ['Nantes, France', 'lucas.moreau@exemple.fr', '+33 6 11 22 33 44', ''],
    profile: "Étudiant en première année de licence, je cherche un job à temps partiel et un stage d'été. Sérieux et ponctuel, j'ai l'habitude de m'occuper d'enfants et de travailler en équipe.",
    exp: [
      ['Baby-sitting', 'Familles du quartier', 'Nantes', "- Garde régulière de deux enfants de 4 et 7 ans, le mercredi et en soirée\n- Aide aux devoirs et préparation des repas"],
      ['Employé polyvalent (job d’été)', 'Camping Les Pins', 'La Baule', "- Accueil des clients et entretien des sanitaires\n- Aide à l'animation des soirées"],
      ['Job d’été', 'Marché de Nantes', 'Nantes', "- Aide à l'installation du stand et service des clients\n- Tenue de la caisse en l'absence du gérant"],
    ],
    edu: [['Licence 1 Économie et gestion', 'Université de Nantes'], ['Baccalauréat général, mention bien', 'Lycée Clemenceau']],
    skills: [['Organisation', 'Ponctualité, sens des priorités'], ['Travail en équipe', 'Écoute, entraide, bonne humeur'], ['Bureautique', 'Word, Excel, Canva']],
    langs: [['Français', 'Langue maternelle'], ['Anglais', 'Courant (B2)'], ['Espagnol', 'Notions (A2)']],
    custom: { title: 'Bénévolat', rows: [['Bénévole', 'Banque alimentaire', 'Nantes', 'Tri et distribution de colis un samedi par mois.']] },
    ints: ['Football', 'Photographie', 'Cinéma'],
  },
  en: {
    first: 'Lucas', last: 'Moreau', title: 'First-year university student',
    fields: ['Leeds, UK', 'lucas.moreau@example.com', '+44 7700 900456', ''],
    profile: 'First-year university student looking for a part-time job and a summer placement. Reliable and punctual, I am used to looking after children and working as part of a team.',
    exp: [
      ['Babysitter', 'Local families', 'Leeds', '- Regular care of two children aged 4 and 7, on Wednesdays and evenings\n- Homework help and meal preparation'],
      ['Summer job: general assistant', 'Pinewood Campsite', 'Whitby', '- Welcomed guests and cleaned the washrooms\n- Helped run the evening activities'],
      ['Summer job', 'Leeds Market', 'Leeds', '- Helped set up the stall and served customers\n- Ran the till when the owner was away'],
    ],
    edu: [['BSc Economics and Management, year 1', 'University of Leeds'], ['A-levels: Maths, Economics, Geography', 'Roundhay School']],
    skills: [['Organisation', 'Punctuality, sense of priorities'], ['Teamwork', 'Listening, helping out, good humour'], ['Office software', 'Word, Excel, Canva']],
    langs: [['English', 'Native'], ['French', 'Fluent (B2)'], ['Spanish', 'Basic (A2)']],
    custom: { title: 'Volunteering', rows: [['Volunteer', 'Food bank', 'Leeds', 'Sorting and handing out parcels one Saturday a month.']] },
    ints: ['Football', 'Photography', 'Cinema'],
  },
  es: {
    first: 'Lucas', last: 'Moreau', title: 'Estudiante de primer curso de grado',
    fields: ['Sevilla, España', 'lucas.moreau@ejemplo.es', '+34 622 334 455', ''],
    profile: 'Estudiante de primer curso de grado, busco un trabajo a tiempo parcial y unas prácticas de verano. Serio y puntual, estoy acostumbrado a cuidar niños y a trabajar en equipo.',
    exp: [
      ['Cuidador de niños', 'Familias del barrio', 'Sevilla', '- Cuidado regular de dos niños de 4 y 7 años, los miércoles y por las tardes\n- Ayuda con los deberes y preparación de comidas'],
      ['Empleado polivalente (verano)', 'Camping Los Pinos', 'Conil de la Frontera', '- Recepción de clientes y limpieza de los aseos\n- Ayuda en la animación nocturna'],
      ['Trabajo de verano', 'Mercado de Triana', 'Sevilla', '- Montaje del puesto y atención a los clientes\n- Manejo de la caja en ausencia del encargado'],
    ],
    edu: [['Grado en Administración y Dirección de Empresas, 1.º', 'Universidad de Sevilla'], ['Bachillerato de Ciencias Sociales, nota 9,1', 'IES Murillo']],
    skills: [['Organización', 'Puntualidad, sentido de las prioridades'], ['Trabajo en equipo', 'Escucha, ayuda mutua, buen humor'], ['Ofimática', 'Word, Excel, Canva']],
    langs: [['Español', 'Lengua materna'], ['Inglés', 'Avanzado (B2)'], ['Francés', 'Nociones (A2)']],
    custom: { title: 'Voluntariado', rows: [['Voluntario', 'Banco de alimentos', 'Sevilla', 'Clasificación y reparto de lotes un sábado al mes.']] },
    ints: ['Fútbol', 'Fotografía', 'Cine'],
  },
  de: {
    first: 'Lucas', last: 'Moreau', title: 'Student im ersten Semester',
    fields: ['Leipzig, Deutschland', 'lucas.moreau@beispiel.de', '+49 152 33445566', ''],
    profile: 'Student im ersten Studienjahr, auf der Suche nach einem Nebenjob und einem Ferienjob. Zuverlässig und pünktlich, mit Erfahrung in der Kinderbetreuung und in der Teamarbeit.',
    exp: [
      ['Babysitter', 'Familien aus dem Viertel', 'Leipzig', '- Regelmäßige Betreuung von zwei Kindern (4 und 7 Jahre), mittwochs und abends\n- Hausaufgabenhilfe und Zubereitung von Mahlzeiten'],
      ['Aushilfe (Ferienjob)', 'Campingplatz Kiefernwald', 'Rerik', '- Empfang der Gäste und Reinigung der Sanitäranlagen\n- Mithilfe bei den Abendveranstaltungen'],
      ['Ferienjob', 'Wochenmarkt Leipzig', 'Leipzig', '- Aufbau des Standes und Bedienung der Kunden\n- Kassenführung in Abwesenheit des Inhabers'],
    ],
    edu: [['Bachelor Wirtschaftswissenschaften, 1. Semester', 'Universität Leipzig'], ['Abitur, Note 1,7', 'Gymnasium Thomasschule']],
    skills: [['Organisation', 'Pünktlichkeit, Gespür für Prioritäten'], ['Teamarbeit', 'Zuhören, Hilfsbereitschaft, gute Laune'], ['Office-Programme', 'Word, Excel, Canva']],
    langs: [['Deutsch', 'Muttersprache'], ['Englisch', 'Fließend (B2)'], ['Spanisch', 'Grundkenntnisse (A2)']],
    custom: { title: 'Ehrenamt', rows: [['Ehrenamtlicher Helfer', 'Tafel', 'Leipzig', 'Sortieren und Ausgeben von Lebensmitteln an einem Samstag im Monat.']] },
    ints: ['Fußball', 'Fotografie', 'Kino'],
  },
  it: {
    first: 'Lucas', last: 'Moreau', title: 'Studente del primo anno di università',
    fields: ['Torino, Italia', 'lucas.moreau@esempio.it', '+39 342 112 2334', ''],
    profile: "Studente del primo anno di università, cerco un lavoro part-time e un impiego estivo. Serio e puntuale, sono abituato a badare ai bambini e a lavorare in squadra.",
    exp: [
      ['Babysitter', 'Famiglie del quartiere', 'Torino', "- Cura regolare di due bambini di 4 e 7 anni, il mercoledì e la sera\n- Aiuto con i compiti e preparazione dei pasti"],
      ['Addetto polivalente (lavoro estivo)', 'Campeggio I Pini', 'Alassio', "- Accoglienza degli ospiti e pulizia dei servizi\n- Aiuto nell'animazione serale"],
      ['Lavoro estivo', 'Mercato di Porta Palazzo', 'Torino', '- Allestimento della bancarella e servizio ai clienti\n- Gestione della cassa in assenza del titolare'],
    ],
    edu: [['Laurea triennale in Economia, primo anno', 'Università di Torino'], ['Diploma di maturità scientifica, 90/100', 'Liceo Gioberti']],
    skills: [['Organizzazione', 'Puntualità, senso delle priorità'], ['Lavoro di squadra', 'Ascolto, aiuto reciproco, buon umore'], ['Informatica', 'Word, Excel, Canva']],
    langs: [['Italiano', 'Madrelingua'], ['Inglese', 'Buono (B2)'], ['Spagnolo', 'Nozioni di base (A2)']],
    custom: { title: 'Volontariato', rows: [['Volontario', 'Banco alimentare', 'Torino', 'Smistamento e distribuzione di pacchi un sabato al mese.']] },
    ints: ['Calcio', 'Fotografia', 'Cinema'],
  },
  pt: {
    first: 'Lucas', last: 'Moreau', title: 'Estudante do 1.º ano de licenciatura',
    fields: ['Braga, Portugal', 'lucas.moreau@exemplo.pt', '+351 913 223 344', ''],
    profile: 'Estudante do 1.º ano de licenciatura, procuro um trabalho a tempo parcial e um emprego de verão. Sério e pontual, estou habituado a cuidar de crianças e a trabalhar em equipa.',
    exp: [
      ['Babysitter', 'Famílias do bairro', 'Braga', '- Acompanhamento regular de duas crianças de 4 e 7 anos, às quartas-feiras e à noite\n- Ajuda nos trabalhos de casa e preparação de refeições'],
      ['Auxiliar polivalente (verão)', 'Parque de Campismo dos Pinhais', 'Esposende', '- Receção dos clientes e limpeza dos balneários\n- Ajuda na animação noturna'],
      ['Emprego de verão', 'Mercado Municipal de Braga', 'Braga', '- Montagem da banca e atendimento aos clientes\n- Gestão da caixa na ausência do responsável'],
    ],
    edu: [['Licenciatura em Gestão, 1.º ano', 'Universidade do Minho'], ['12.º ano, Ciências Socioeconómicas, média 16', 'Escola Secundária Sá de Miranda']],
    skills: [['Organização', 'Pontualidade, sentido das prioridades'], ['Trabalho em equipa', 'Escuta, entreajuda, bom humor'], ['Informática', 'Word, Excel, Canva']],
    langs: [['Português', 'Língua materna'], ['Inglês', 'Fluente (B2)'], ['Espanhol', 'Noções (A2)']],
    custom: { title: 'Voluntariado', rows: [['Voluntário', 'Banco Alimentar', 'Braga', 'Triagem e distribuição de cabazes num sábado por mês.']] },
    ints: ['Futebol', 'Fotografia', 'Cinema'],
  },
  ar: {
    first: 'يوسف', last: 'المنصوري', title: 'طالب في السنة الأولى الجامعية',
    fields: ['الرباط، المغرب', 'youssef.mansouri@example.com', '+212 6 62 33 44 55', ''],
    profile: 'طالب في السنة الأولى الجامعية، أبحث عن عمل بدوام جزئي وعن عمل صيفي. جاد وملتزم بالمواعيد، ولي خبرة في رعاية الأطفال والعمل ضمن فريق.',
    exp: [
      ['جليس أطفال', 'أسر الحي', 'الرباط', '- رعاية منتظمة لطفلين عمرهما 4 و7 سنوات، أيام الأربعاء ومساءً\n- المساعدة في الواجبات المدرسية وتحضير الوجبات'],
      ['عامل متعدد المهام (صيفًا)', 'مخيم الصنوبر', 'مولاي بوسلهام', '- استقبال النزلاء وتنظيف المرافق\n- المساعدة في تنشيط السهرات'],
      ['عمل صيفي', 'سوق المدينة', 'الرباط', '- تجهيز المحل وخدمة الزبائن\n- إدارة الصندوق في غياب صاحب المحل'],
    ],
    edu: [['إجازة في الاقتصاد والتدبير، السنة الأولى', 'جامعة محمد الخامس'], ['باكالوريا علوم اقتصادية، ميزة حسن', 'ثانوية الحسن الثاني']],
    skills: [['التنظيم', 'احترام المواعيد وتحديد الأولويات'], ['العمل الجماعي', 'الإصغاء والتعاون وروح مرحة'], ['المكتبية', 'Word وExcel وCanva']],
    langs: [['العربية', 'اللغة الأم'], ['الفرنسية', 'طلاقة'], ['الإنجليزية', 'مستوى متوسط']],
    custom: { title: 'العمل التطوعي', rows: [['متطوع', 'بنك الطعام', 'الرباط', 'فرز وتوزيع الطرود يوم سبت من كل شهر.']] },
    ints: ['كرة القدم', 'التصوير', 'السينما'],
  },
}

export const retailContent = (lang: string): Content => build(retail[lang] ?? retail.en, retailD)
export const firstContent = (lang: string): Content => build(first[lang] ?? first.en, firstD)
