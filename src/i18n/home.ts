import type { Lang } from '../model/types'

export const GITHUB_URL = 'https://github.com/lepalph/CVLove'

/** Textes de l'accueil (langue de l'INTERFACE). */
export interface Home {
  navModels: string
  navHow: string
  navCode: string
  create: string
  seeCode: string
  heroTitle: string
  heroSub: string
  meta: string
  demoLabel: string
  demoCaption: string
  howTitle: string
  /** [mot d'ordre, explication] */
  steps: [string, string][]
  /** `{n}` = nombre de modèles du catalogue. */
  modelsTitle: string
  useTemplate: string
  privacyTitle: string
  privacyText: string
  readCode: string
  langsTitle: string
  langsText: string
  openTitle: string
  openText: string
  contribute: string
  finalTitle: string
  license: string
  source: string
  noCookie: string
}

const fr: Home = {
  navModels: 'Modèles', navHow: 'Comment ça marche', navCode: 'Code source',
  create: 'Créer mon CV', seeCode: 'Voir le code sur GitHub',
  heroTitle: 'Votre CV en PDF, sans compte et sans frais.',
  heroSub: 'Remplissez vos informations une fois, essayez les modèles, puis téléchargez le PDF. Tout se passe sur votre appareil.',
  meta: 'Gratuit et open source · 7 langues · Sans inscription',
  demoLabel: 'Modèle de démonstration', demoCaption: 'Mêmes informations, quatre mises en page.',
  howTitle: 'Comment ça marche',
  steps: [
    ['Remplissez.', 'Nom, expériences, formation : chaque champ peut être masqué, renommé ou déplacé.'],
    ['Changez de modèle quand vous voulez.', 'Vos informations sont conservées, seule la mise en page change.'],
    ['Téléchargez.', 'Le PDF est fabriqué dans votre navigateur et prêt à envoyer.'],
  ],
  modelsTitle: 'Un catalogue de {n} modèles', useTemplate: 'Commencer avec ce modèle',
  privacyTitle: 'Vos données restent chez vous',
  privacyText: 'Vous n’avez pas de compte à créer et aucun serveur ne stocke votre CV : il est enregistré dans votre navigateur, qui fabrique aussi le PDF. Le code est public, n’importe qui peut le vérifier. Pour passer sur un autre appareil, exportez votre CV dans un fichier puis réimportez-le.',
  readCode: 'Lire le code',
  langsTitle: 'Un CV en français aujourd’hui, en anglais demain',
  langsText: 'Changez la langue du CV : les titres de sections et les dates s’adaptent, votre texte reste tel quel.',
  openTitle: 'Un projet ouvert',
  openText: 'Le code est sous licence MIT. Vous pouvez proposer un modèle, corriger une traduction ou signaler un problème sur GitHub.',
  contribute: 'Contribuer sur GitHub',
  finalTitle: 'Il ne vous manque plus que vos informations.',
  license: 'Licence MIT', source: 'Code source', noCookie: 'Aucun cookie',
}

const en: Home = {
  navModels: 'Templates', navHow: 'How it works', navCode: 'Source code',
  create: 'Create my CV', seeCode: 'View the code on GitHub',
  heroTitle: 'Your CV as a PDF, no account, no fees.',
  heroSub: 'Enter your details once, try the templates, then download the PDF. Everything happens on your device.',
  meta: 'Free and open source · 7 languages · No sign-up',
  demoLabel: 'Demo template', demoCaption: 'Same details, four layouts.',
  howTitle: 'How it works',
  steps: [
    ['Fill in.', 'Name, experience, education: every field can be hidden, renamed or moved.'],
    ['Switch templates whenever you like.', 'Your details are kept, only the layout changes.'],
    ['Download.', 'The PDF is built in your browser and ready to send.'],
  ],
  modelsTitle: 'A catalogue of {n} templates', useTemplate: 'Start with this template',
  privacyTitle: 'Your data stays with you',
  privacyText: 'You don’t need an account and no server stores your CV: it is saved in your browser, which also builds the PDF. The code is public, anyone can check it. To move to another device, export your CV to a file and import it again.',
  readCode: 'Read the code',
  langsTitle: 'A CV in English today, in French tomorrow',
  langsText: 'Change the CV language: section titles and dates adapt, your own text stays as it is.',
  openTitle: 'An open project',
  openText: 'The code is released under the MIT licence. You can suggest a template, fix a translation or report a problem on GitHub.',
  contribute: 'Contribute on GitHub',
  finalTitle: 'All you need now is your details.',
  license: 'MIT licence', source: 'Source code', noCookie: 'No cookies',
}

const es: Home = {
  navModels: 'Plantillas', navHow: 'Cómo funciona', navCode: 'Código fuente',
  create: 'Crear mi CV', seeCode: 'Ver el código en GitHub',
  heroTitle: 'Tu CV en PDF, sin cuenta y sin coste.',
  heroSub: 'Rellena tus datos una sola vez, prueba las plantillas y descarga el PDF. Todo ocurre en tu dispositivo.',
  meta: 'Gratis y de código abierto · 7 idiomas · Sin registro',
  demoLabel: 'Plantilla de demostración', demoCaption: 'Los mismos datos, cuatro diseños.',
  howTitle: 'Cómo funciona',
  steps: [
    ['Rellena.', 'Nombre, experiencia, formación: cada campo se puede ocultar, renombrar o mover.'],
    ['Cambia de plantilla cuando quieras.', 'Tus datos se conservan, solo cambia el diseño.'],
    ['Descarga.', 'El PDF se crea en tu navegador y queda listo para enviar.'],
  ],
  modelsTitle: 'Un catálogo de {n} plantillas', useTemplate: 'Empezar con esta plantilla',
  privacyTitle: 'Tus datos se quedan contigo',
  privacyText: 'No tienes que crear ninguna cuenta y ningún servidor guarda tu CV: se guarda en tu navegador, que también crea el PDF. El código es público y cualquiera puede comprobarlo. Para pasar a otro dispositivo, exporta tu CV a un archivo y vuelve a importarlo.',
  readCode: 'Leer el código',
  langsTitle: 'Un CV en español hoy, en inglés mañana',
  langsText: 'Cambia el idioma del CV: los títulos de las secciones y las fechas se adaptan, tu texto se queda tal cual.',
  openTitle: 'Un proyecto abierto',
  openText: 'El código tiene licencia MIT. Puedes proponer una plantilla, corregir una traducción o informar de un problema en GitHub.',
  contribute: 'Contribuir en GitHub',
  finalTitle: 'Solo te faltan tus datos.',
  license: 'Licencia MIT', source: 'Código fuente', noCookie: 'Sin cookies',
}

const de: Home = {
  navModels: 'Vorlagen', navHow: 'So funktioniert’s', navCode: 'Quellcode',
  create: 'Lebenslauf erstellen', seeCode: 'Code auf GitHub ansehen',
  heroTitle: 'Ihr Lebenslauf als PDF, ohne Konto und kostenlos.',
  heroSub: 'Geben Sie Ihre Angaben einmal ein, probieren Sie die Vorlagen aus und laden Sie dann das PDF herunter. Alles passiert auf Ihrem Gerät.',
  meta: 'Kostenlos und Open Source · 7 Sprachen · Ohne Anmeldung',
  demoLabel: 'Demo-Vorlage', demoCaption: 'Dieselben Angaben, vier Layouts.',
  howTitle: 'So funktioniert’s',
  steps: [
    ['Ausfüllen.', 'Name, Berufserfahrung, Ausbildung: Jedes Feld lässt sich ausblenden, umbenennen oder verschieben.'],
    ['Wechseln Sie die Vorlage, wann Sie möchten.', 'Ihre Angaben bleiben erhalten, nur das Layout ändert sich.'],
    ['Herunterladen.', 'Das PDF wird in Ihrem Browser erstellt und ist sofort versandbereit.'],
  ],
  modelsTitle: 'Ein Katalog mit {n} Vorlagen', useTemplate: 'Mit dieser Vorlage beginnen',
  privacyTitle: 'Ihre Daten bleiben bei Ihnen',
  privacyText: 'Sie brauchen kein Konto, und kein Server speichert Ihren Lebenslauf: Er wird in Ihrem Browser gespeichert, der auch das PDF erstellt. Der Code ist öffentlich, jeder kann ihn überprüfen. Für den Wechsel auf ein anderes Gerät exportieren Sie Ihren Lebenslauf in eine Datei und importieren ihn dort wieder.',
  readCode: 'Code lesen',
  langsTitle: 'Heute ein Lebenslauf auf Deutsch, morgen auf Englisch',
  langsText: 'Ändern Sie die Sprache des Lebenslaufs: Abschnittstitel und Datumsangaben passen sich an, Ihr eigener Text bleibt unverändert.',
  openTitle: 'Ein offenes Projekt',
  openText: 'Der Code steht unter der MIT-Lizenz. Sie können eine Vorlage vorschlagen, eine Übersetzung korrigieren oder ein Problem auf GitHub melden.',
  contribute: 'Auf GitHub mitwirken',
  finalTitle: 'Es fehlen nur noch Ihre Angaben.',
  license: 'MIT-Lizenz', source: 'Quellcode', noCookie: 'Keine Cookies',
}

const it: Home = {
  navModels: 'Modelli', navHow: 'Come funziona', navCode: 'Codice sorgente',
  create: 'Crea il mio CV', seeCode: 'Vedi il codice su GitHub',
  heroTitle: 'Il tuo CV in PDF, senza account e senza costi.',
  heroSub: 'Inserisci i tuoi dati una volta sola, prova i modelli e poi scarica il PDF. Tutto avviene sul tuo dispositivo.',
  meta: 'Gratuito e open source · 7 lingue · Senza registrazione',
  demoLabel: 'Modello di dimostrazione', demoCaption: 'Stessi dati, quattro impaginazioni.',
  howTitle: 'Come funziona',
  steps: [
    ['Compila.', 'Nome, esperienze, formazione: ogni campo può essere nascosto, rinominato o spostato.'],
    ['Cambia modello quando vuoi.', 'I tuoi dati restano, cambia solo l’impaginazione.'],
    ['Scarica.', 'Il PDF viene creato nel tuo browser ed è pronto da inviare.'],
  ],
  modelsTitle: 'Un catalogo di {n} modelli', useTemplate: 'Inizia con questo modello',
  privacyTitle: 'I tuoi dati restano con te',
  privacyText: 'Non devi creare nessun account e nessun server conserva il tuo CV: è salvato nel tuo browser, che crea anche il PDF. Il codice è pubblico, chiunque può verificarlo. Per passare a un altro dispositivo, esporta il CV in un file e importalo di nuovo.',
  readCode: 'Leggi il codice',
  langsTitle: 'Un CV in italiano oggi, in inglese domani',
  langsText: 'Cambia la lingua del CV: i titoli delle sezioni e le date si adattano, il tuo testo resta com’è.',
  openTitle: 'Un progetto aperto',
  openText: 'Il codice è distribuito con licenza MIT. Puoi proporre un modello, correggere una traduzione o segnalare un problema su GitHub.',
  contribute: 'Contribuisci su GitHub',
  finalTitle: 'Ti mancano solo i tuoi dati.',
  license: 'Licenza MIT', source: 'Codice sorgente', noCookie: 'Nessun cookie',
}

const pt: Home = {
  navModels: 'Modelos', navHow: 'Como funciona', navCode: 'Código-fonte',
  create: 'Criar o meu CV', seeCode: 'Ver o código no GitHub',
  heroTitle: 'O seu CV em PDF, sem conta e sem custos.',
  heroSub: 'Preencha os seus dados uma só vez, experimente os modelos e depois descarregue o PDF. Tudo acontece no seu dispositivo.',
  meta: 'Gratuito e de código aberto · 7 idiomas · Sem registo',
  demoLabel: 'Modelo de demonstração', demoCaption: 'Os mesmos dados, quatro layouts.',
  howTitle: 'Como funciona',
  steps: [
    ['Preencha.', 'Nome, experiências, formação: cada campo pode ser ocultado, renomeado ou movido.'],
    ['Mude de modelo quando quiser.', 'Os seus dados são mantidos, só o layout muda.'],
    ['Descarregue.', 'O PDF é criado no seu navegador e fica pronto a enviar.'],
  ],
  modelsTitle: 'Um catálogo de {n} modelos', useTemplate: 'Começar com este modelo',
  privacyTitle: 'Os seus dados ficam consigo',
  privacyText: 'Não precisa de criar conta e nenhum servidor guarda o seu CV: ele fica guardado no seu navegador, que também cria o PDF. O código é público, qualquer pessoa o pode verificar. Para mudar de dispositivo, exporte o seu CV para um ficheiro e importe-o de novo.',
  readCode: 'Ler o código',
  langsTitle: 'Um CV em português hoje, em inglês amanhã',
  langsText: 'Mude o idioma do CV: os títulos das secções e as datas adaptam-se, o seu texto mantém-se como está.',
  openTitle: 'Um projeto aberto',
  openText: 'O código está sob licença MIT. Pode propor um modelo, corrigir uma tradução ou reportar um problema no GitHub.',
  contribute: 'Contribuir no GitHub',
  finalTitle: 'Só lhe faltam os seus dados.',
  license: 'Licença MIT', source: 'Código-fonte', noCookie: 'Sem cookies',
}

const ar: Home = {
  navModels: 'القوالب', navHow: 'كيف يعمل', navCode: 'الشيفرة المصدرية',
  create: 'أنشئ سيرتي الذاتية', seeCode: 'عرض الشيفرة على GitHub',
  heroTitle: 'سيرتك الذاتية بصيغة PDF، بلا حساب وبلا مقابل.',
  heroSub: 'املأ معلوماتك مرة واحدة، جرّب القوالب، ثم نزّل ملف PDF. كل شيء يتم على جهازك.',
  meta: 'مجاني ومفتوح المصدر · 7 لغات · بلا تسجيل',
  demoLabel: 'قالب العرض', demoCaption: 'المعلومات نفسها، أربعة تصاميم.',
  howTitle: 'كيف يعمل',
  steps: [
    ['املأ.', 'الاسم والخبرات والتعليم: يمكن إخفاء أي حقل أو إعادة تسميته أو نقله.'],
    ['غيّر القالب متى شئت.', 'تبقى معلوماتك كما هي، ويتغير التصميم فقط.'],
    ['نزّل.', 'يُنشأ ملف PDF داخل متصفحك وهو جاهز للإرسال.'],
  ],
  modelsTitle: 'كتالوج من {n} قالبًا', useTemplate: 'ابدأ بهذا القالب',
  privacyTitle: 'بياناتك تبقى عندك',
  privacyText: 'لا حاجة إلى إنشاء حساب، ولا يخزّن أي خادم سيرتك الذاتية: تُحفظ في متصفحك الذي ينشئ ملف PDF أيضًا. الشيفرة علنية ويمكن لأي شخص التحقق منها. للانتقال إلى جهاز آخر، صدّر سيرتك الذاتية إلى ملف ثم استورده من جديد.',
  readCode: 'اقرأ الشيفرة',
  langsTitle: 'سيرة ذاتية بالعربية اليوم، وبالإنجليزية غدًا',
  langsText: 'غيّر لغة السيرة الذاتية: تتكيّف عناوين الأقسام والتواريخ، ويبقى نصك كما كتبته.',
  openTitle: 'مشروع مفتوح',
  openText: 'الشيفرة مرخّصة بموجب MIT. يمكنك اقتراح قالب أو تصحيح ترجمة أو الإبلاغ عن مشكلة على GitHub.',
  contribute: 'ساهم على GitHub',
  finalTitle: 'لا ينقصك سوى معلوماتك.',
  license: 'ترخيص MIT', source: 'الشيفرة المصدرية', noCookie: 'بلا ملفات تعريف ارتباط',
}

export const home: Record<Lang, Home> = { fr, en, es, de, it, pt, ar }
