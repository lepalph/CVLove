import type { Lang } from '../model/types'

/** Libellés IMPRIMÉS sur la lettre (langue de la lettre) : « Objet » et les formules proposées par défaut (modifiables). */
export interface LetterLabels {
  subject: string
  salutation: string
  closing: string
}

export const letterLabels: Record<Lang, LetterLabels> = {
  // Apostrophes droites : l'apostrophe typographique (U+2019) fausse la mise en ligne de react-pdf après le rendu d'un autre document (voir check:pdf).
  fr: { subject: 'Objet', salutation: 'Madame, Monsieur,', closing: "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées." },
  en: { subject: 'Subject', salutation: 'Dear Sir or Madam,', closing: 'Yours faithfully,' },
  es: { subject: 'Asunto', salutation: 'Estimados señores:', closing: 'Atentamente,' },
  de: { subject: 'Betreff', salutation: 'Sehr geehrte Damen und Herren,', closing: 'Mit freundlichen Grüßen' },
  it: { subject: 'Oggetto', salutation: 'Gentili Signore e Signori,', closing: 'Cordiali saluti,' },
  pt: { subject: 'Assunto', salutation: 'Exmos. Senhores,', closing: 'Com os melhores cumprimentos,' },
  ar: { subject: 'الموضوع', salutation: 'تحية طيبة وبعد،', closing: 'وتفضلوا بقبول فائق الاحترام والتقدير.' },
}

/** Textes de l'INTERFACE pour les lettres. `steps` et `hints` : Expéditeur, Destinataire, Objet, Corps, Design, Télécharger. */
export interface LetterUI {
  newLetter: string
  source: string
  scratch: string
  create: string
  cancel: string
  matching: string
  steps: string[]
  hints: string[]
  name: string
  jobTitle: string
  address: string
  recName: string
  company: string
  place: string
  date: string
  subject: string
  salutation: string
  body: string
  bodyHint: string
  bodyPlaceholder: string
  closing: string
  signature: string
  layout: string
  letterLang: string
  readyText: string
}

const fr: LetterUI = {
  newLetter: 'Nouvelle lettre', source: 'CV source', scratch: 'Partir de zéro', create: 'Créer la lettre', cancel: 'Annuler',
  matching: 'Créer la lettre assortie',
  steps: ['Expéditeur', 'Destinataire', 'Objet', 'Corps', 'Design', 'Télécharger'],
  hints: [
    'Vos coordonnées, reprises de votre CV. Modifiez-les ici sans toucher au CV.',
    'À qui écrivez-vous ? Tout est facultatif.',
    'Lieu, date, objet et formule d’appel.',
    'Votre texte : une ligne vide sépare deux paragraphes. Puis la formule de politesse et la signature.',
    'Mise en page, couleur, police et marges : réglez l’aspect de la lettre.',
    'Votre lettre est prête. Vérifiez l’aperçu, puis téléchargez-la.',
  ],
  name: 'Nom complet', jobTitle: 'Titre', address: 'Adresse', recName: 'Nom du destinataire', company: 'Entreprise', place: 'Lieu', date: 'Date',
  subject: 'Objet', salutation: 'Formule d’appel', body: 'Corps de la lettre', bodyHint: 'Une ligne vide sépare deux paragraphes. La formule d’appel et la formule de politesse sont déjà ajoutées : ne les retapez pas.',
  bodyPlaceholder: "Pourquoi cette entreprise : ce qui vous attire dans son activité ou son annonce.\n\nCe que vous apportez : une expérience ou une qualité, avec un exemple précis.\n\nVotre disponibilité : proposez un échange ou un entretien.",
  closing: 'Formule de politesse', signature: 'Signature', layout: 'Mise en page', letterLang: 'Langue de la lettre',
  readyText: 'Le PDF est fabriqué sur votre appareil. Vous pouvez revenir modifier la lettre à tout moment.',
}
const en: LetterUI = {
  newLetter: 'New letter', source: 'Source CV', scratch: 'Start from scratch', create: 'Create letter', cancel: 'Cancel',
  matching: 'Create the matching letter',
  steps: ['Sender', 'Recipient', 'Subject', 'Body', 'Design', 'Download'],
  hints: [
    'Your details, taken from your CV. Edit them here without touching the CV.',
    'Who are you writing to? Everything is optional.',
    'Place, date, subject line and salutation.',
    'Your text: a blank line separates two paragraphs. Then the closing and your signature.',
    'Layout, colour, font and margins: set how the letter looks.',
    'Your letter is ready. Check the preview, then download it.',
  ],
  name: 'Full name', jobTitle: 'Title', address: 'Address', recName: 'Recipient name', company: 'Company', place: 'Place', date: 'Date',
  subject: 'Subject', salutation: 'Salutation', body: 'Letter body', bodyHint: 'A blank line separates two paragraphs. The salutation and the closing are already added: do not retype them.',
  bodyPlaceholder: "Why this company: what draws you to its work or to the advert.\n\nWhat you bring: one experience or strength, with a concrete example.\n\nYour availability: suggest a call or an interview.",
  closing: 'Closing', signature: 'Signature', layout: 'Layout', letterLang: 'Letter language',
  readyText: 'The PDF is made on your device. You can come back and edit the letter at any time.',
}
const es: LetterUI = {
  newLetter: 'Nueva carta', source: 'CV de origen', scratch: 'Empezar de cero', create: 'Crear la carta', cancel: 'Cancelar',
  matching: 'Crear la carta a juego',
  steps: ['Remitente', 'Destinatario', 'Asunto', 'Cuerpo', 'Diseño', 'Descargar'],
  hints: [
    'Tus datos, tomados de tu CV. Edítalos aquí sin tocar el CV.',
    '¿A quién escribes? Todo es opcional.',
    'Lugar, fecha, asunto y saludo.',
    'Tu texto: una línea en blanco separa dos párrafos. Después la despedida y la firma.',
    'Diseño, color, fuente y márgenes: ajusta el aspecto de la carta.',
    'Tu carta está lista. Revisa la vista previa y descárgala.',
  ],
  name: 'Nombre completo', jobTitle: 'Título', address: 'Dirección', recName: 'Nombre del destinatario', company: 'Empresa', place: 'Lugar', date: 'Fecha',
  subject: 'Asunto', salutation: 'Saludo', body: 'Cuerpo de la carta', bodyHint: 'Una línea en blanco separa dos párrafos. No repitas el saludo ni la despedida: ya están añadidos.',
  bodyPlaceholder: "Por qué esta empresa: qué te atrae de su actividad o de la oferta.\n\nQué aportas: una experiencia o cualidad, con un ejemplo concreto.\n\nTu disponibilidad: propón una llamada o una entrevista.",
  closing: 'Despedida', signature: 'Firma', layout: 'Diseño de página', letterLang: 'Idioma de la carta',
  readyText: 'El PDF se crea en tu dispositivo. Puedes volver a editar la carta cuando quieras.',
}
const de: LetterUI = {
  newLetter: 'Neues Anschreiben', source: 'Ausgangs-Lebenslauf', scratch: 'Von null beginnen', create: 'Anschreiben erstellen', cancel: 'Abbrechen',
  matching: 'Passendes Anschreiben erstellen',
  steps: ['Absender', 'Empfänger', 'Betreff', 'Text', 'Design', 'Herunterladen'],
  hints: [
    'Ihre Angaben, aus Ihrem Lebenslauf übernommen. Hier ändern, ohne den Lebenslauf anzufassen.',
    'An wen schreiben Sie? Alles ist optional.',
    'Ort, Datum, Betreff und Anrede.',
    'Ihr Text: Eine Leerzeile trennt zwei Absätze. Danach Grußformel und Unterschrift.',
    'Layout, Farbe, Schrift und Ränder: Gestalten Sie das Anschreiben.',
    'Ihr Anschreiben ist fertig. Prüfen Sie die Vorschau und laden Sie es herunter.',
  ],
  name: 'Vollständiger Name', jobTitle: 'Titel', address: 'Adresse', recName: 'Name des Empfängers', company: 'Unternehmen', place: 'Ort', date: 'Datum',
  subject: 'Betreff', salutation: 'Anrede', body: 'Text des Anschreibens', bodyHint: 'Eine Leerzeile trennt zwei Absätze. Anrede und Grußformel nicht erneut eintippen: Sie sind schon hinzugefügt.',
  bodyPlaceholder: "Warum dieses Unternehmen: was Sie an seiner Arbeit oder an der Anzeige reizt.\n\nWas Sie mitbringen: eine Erfahrung oder Stärke, mit einem konkreten Beispiel.\n\nIhre Verfügbarkeit: schlagen Sie ein Gespräch vor.",
  closing: 'Grußformel', signature: 'Unterschrift', layout: 'Layout', letterLang: 'Sprache des Anschreibens',
  readyText: 'Das PDF entsteht auf Ihrem Gerät. Sie können das Anschreiben jederzeit weiter bearbeiten.',
}
const it: LetterUI = {
  newLetter: 'Nuova lettera', source: 'CV di partenza', scratch: 'Parti da zero', create: 'Crea la lettera', cancel: 'Annulla',
  matching: 'Crea la lettera coordinata',
  steps: ['Mittente', 'Destinatario', 'Oggetto', 'Corpo', 'Design', 'Scarica'],
  hints: [
    'I tuoi dati, ripresi dal tuo CV. Modificali qui senza toccare il CV.',
    'A chi scrivi? Tutto è facoltativo.',
    'Luogo, data, oggetto e formula di apertura.',
    'Il tuo testo: una riga vuota separa due paragrafi. Poi la formula di chiusura e la firma.',
    'Impaginazione, colore, carattere e margini: regola l’aspetto della lettera.',
    'La tua lettera è pronta. Controlla l’anteprima e scaricala.',
  ],
  name: 'Nome completo', jobTitle: 'Titolo', address: 'Indirizzo', recName: 'Nome del destinatario', company: 'Azienda', place: 'Luogo', date: 'Data',
  subject: 'Oggetto', salutation: 'Formula di apertura', body: 'Corpo della lettera', bodyHint: 'Una riga vuota separa due paragrafi. Non riscrivere la formula di apertura né il saluto finale: sono già aggiunti.',
  bodyPlaceholder: "Perché questa azienda: cosa ti attira della sua attività o dell’annuncio.\n\nCosa porti: un’esperienza o una qualità, con un esempio concreto.\n\nLa tua disponibilità: proponi una chiamata o un colloquio.",
  closing: 'Formula di chiusura', signature: 'Firma', layout: 'Impaginazione', letterLang: 'Lingua della lettera',
  readyText: 'Il PDF viene creato sul tuo dispositivo. Puoi tornare a modificare la lettera quando vuoi.',
}
const pt: LetterUI = {
  newLetter: 'Nova carta', source: 'CV de origem', scratch: 'Começar do zero', create: 'Criar a carta', cancel: 'Cancelar',
  matching: 'Criar a carta a condizer',
  steps: ['Remetente', 'Destinatário', 'Assunto', 'Corpo', 'Design', 'Transferir'],
  hints: [
    'Os seus dados, retirados do seu CV. Edite-os aqui sem mexer no CV.',
    'A quem escreve? Tudo é opcional.',
    'Local, data, assunto e saudação.',
    'O seu texto: uma linha em branco separa dois parágrafos. Depois a despedida e a assinatura.',
    'Layout, cor, tipo de letra e margens: ajuste o aspeto da carta.',
    'A sua carta está pronta. Confira a pré-visualização e transfira-a.',
  ],
  name: 'Nome completo', jobTitle: 'Título', address: 'Morada', recName: 'Nome do destinatário', company: 'Empresa', place: 'Local', date: 'Data',
  subject: 'Assunto', salutation: 'Saudação', body: 'Corpo da carta', bodyHint: 'Uma linha em branco separa dois parágrafos. Não volte a escrever a saudação nem a despedida: já foram adicionadas.',
  bodyPlaceholder: "Porquê esta empresa: o que o atrai na sua atividade ou no anúncio.\n\nO que traz: uma experiência ou qualidade, com um exemplo concreto.\n\nA sua disponibilidade: proponha uma conversa ou uma entrevista.",
  closing: 'Despedida', signature: 'Assinatura', layout: 'Layout', letterLang: 'Idioma da carta',
  readyText: 'O PDF é criado no seu dispositivo. Pode voltar a editar a carta quando quiser.',
}
const ar: LetterUI = {
  newLetter: 'رسالة جديدة', source: 'السيرة الذاتية المصدر', scratch: 'البدء من الصفر', create: 'إنشاء الرسالة', cancel: 'إلغاء',
  matching: 'إنشاء الرسالة المطابقة',
  steps: ['المرسل', 'المستلم', 'الموضوع', 'النص', 'التصميم', 'التنزيل'],
  hints: [
    'بياناتك المأخوذة من سيرتك الذاتية. عدّلها هنا دون المساس بالسيرة.',
    'لمن تكتب؟ كل شيء اختياري.',
    'المكان والتاريخ والموضوع وعبارة الافتتاح.',
    'نصك: سطر فارغ يفصل بين فقرتين. ثم عبارة الختام والتوقيع.',
    'التصميم واللون والخط والهوامش: اضبط مظهر الرسالة.',
    'رسالتك جاهزة. راجع المعاينة ثم نزّلها.',
  ],
  name: 'الاسم الكامل', jobTitle: 'المسمى', address: 'العنوان', recName: 'اسم المستلم', company: 'الشركة', place: 'المكان', date: 'التاريخ',
  subject: 'الموضوع', salutation: 'عبارة الافتتاح', body: 'نص الرسالة', bodyHint: 'سطر فارغ يفصل بين فقرتين. لا تُعد كتابة عبارة الافتتاح ولا عبارة الختام: فهما مضافتان.',
  bodyPlaceholder: "لماذا هذه الشركة: ما الذي يجذبك في نشاطها أو في الإعلان.\n\nما تقدمه: خبرة أو صفة، مع مثال محدد.\n\nتوفرك: اقترح مكالمة أو مقابلة.",
  closing: 'عبارة الختام', signature: 'التوقيع', layout: 'التخطيط', letterLang: 'لغة الرسالة',
  readyText: 'يُنشأ ملف PDF على جهازك. يمكنك العودة لتعديل الرسالة متى شئت.',
}

export const letterUi: Record<Lang, LetterUI> = { fr, en, es, de, it, pt, ar }
