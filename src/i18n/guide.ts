import type { Lang } from '../model/types'

/** Textes du mode guidé de l'éditeur (langue de l'INTERFACE). `steps` et `hints` suivent l'ordre de STEPS (ui/Guided.tsx). */
export interface Guide {
  mode: string
  guided: string
  full: string
  stepsLabel: string
  /** `{n}` et `{total}` sont remplacés. */
  stepOf: string
  stepDone: string
  prev: string
  next: string
  skip: string
  steps: string[]
  hints: string[]
  recap: string
  readyText: string
  docsLink: string
}

const fr: Guide = {
  mode: 'Mode d’édition', guided: 'Guidé', full: 'Complet', stepsLabel: 'Étapes', stepOf: 'Étape {n} sur {total}', stepDone: 'faite',
  prev: 'Précédent', next: 'Suivant', skip: 'Passer cette étape',
  steps: ['Modèle', 'Identité', 'Profil', 'Expérience', 'Formation', 'Compétences et langues', 'Autres sections', 'Design', 'Télécharger'],
  hints: [
    'Choisissez une mise en page. Vous pourrez en changer à tout moment, vos informations restent.',
    'Qui êtes-vous ? Seul le nom est utile, le reste est facultatif.',
    'Deux ou trois phrases pour dire qui vous êtes et ce que vous cherchez.',
    'Vos postes, du plus récent au plus ancien. Une puce par ligne dans la description.',
    'Vos diplômes et formations.',
    'Ce que vous savez faire et les langues que vous parlez, avec un niveau si vous voulez.',
    'Projets, centres d’intérêt, ou une section de votre choix.',
    'Couleur, police, marges : ajustez l’aspect du document.',
    'Votre CV est prêt. Vérifiez l’aperçu, puis téléchargez-le.',
  ],
  recap: 'Récapitulatif', readyText: 'Le PDF est fabriqué sur votre appareil. Vous pouvez revenir modifier votre CV quand vous voulez.',
  docsLink: 'Voir mes documents',
}

const en: Guide = {
  mode: 'Editing mode', guided: 'Guided', full: 'Full', stepsLabel: 'Steps', stepOf: 'Step {n} of {total}', stepDone: 'done',
  prev: 'Back', next: 'Next', skip: 'Skip this step',
  steps: ['Template', 'Identity', 'Summary', 'Experience', 'Education', 'Skills and languages', 'Other sections', 'Design', 'Download'],
  hints: [
    'Pick a layout. You can change it any time and your details stay.',
    'Who are you? Only the name matters, the rest is optional.',
    'Two or three sentences on who you are and what you are looking for.',
    'Your jobs, most recent first. Put one bullet per line in the description.',
    'Your degrees and training.',
    'What you can do and the languages you speak, with a level if you like.',
    'Projects, interests, or a section of your own.',
    'Colour, font, margins: adjust how the document looks.',
    'Your résumé is ready. Check the preview, then download it.',
  ],
  recap: 'Summary', readyText: 'The PDF is built on your device. You can come back and edit your résumé whenever you like.',
  docsLink: 'See my documents',
}

const es: Guide = {
  mode: 'Modo de edición', guided: 'Guiado', full: 'Completo', stepsLabel: 'Pasos', stepOf: 'Paso {n} de {total}', stepDone: 'hecho',
  prev: 'Anterior', next: 'Siguiente', skip: 'Saltar este paso',
  steps: ['Plantilla', 'Identidad', 'Perfil', 'Experiencia', 'Formación', 'Competencias e idiomas', 'Otras secciones', 'Diseño', 'Descargar'],
  hints: [
    'Elige un diseño. Puedes cambiarlo cuando quieras, tus datos se conservan.',
    '¿Quién eres? Solo el nombre es necesario, lo demás es opcional.',
    'Dos o tres frases sobre quién eres y qué buscas.',
    'Tus puestos, del más reciente al más antiguo. Una viñeta por línea en la descripción.',
    'Tus títulos y estudios.',
    'Lo que sabes hacer y los idiomas que hablas, con un nivel si quieres.',
    'Proyectos, intereses o una sección a tu gusto.',
    'Color, fuente, márgenes: ajusta el aspecto del documento.',
    'Tu CV está listo. Revisa la vista previa y descárgalo.',
  ],
  recap: 'Resumen', readyText: 'El PDF se crea en tu dispositivo. Puedes volver a editar tu CV cuando quieras.',
  docsLink: 'Ver mis documentos',
}

const de: Guide = {
  mode: 'Bearbeitungsmodus', guided: 'Geführt', full: 'Komplett', stepsLabel: 'Schritte', stepOf: 'Schritt {n} von {total}', stepDone: 'erledigt',
  prev: 'Zurück', next: 'Weiter', skip: 'Schritt überspringen',
  steps: ['Vorlage', 'Identität', 'Profil', 'Berufserfahrung', 'Ausbildung', 'Kenntnisse und Sprachen', 'Weitere Abschnitte', 'Design', 'Herunterladen'],
  hints: [
    'Wählen Sie ein Layout. Sie können es jederzeit wechseln, Ihre Angaben bleiben.',
    'Wer sind Sie? Nur der Name ist nötig, der Rest ist freiwillig.',
    'Zwei oder drei Sätze dazu, wer Sie sind und was Sie suchen.',
    'Ihre Stellen, die jüngste zuerst. In der Beschreibung ein Aufzählungspunkt pro Zeile.',
    'Ihre Abschlüsse und Ausbildungen.',
    'Was Sie können und welche Sprachen Sie sprechen, auf Wunsch mit Stufe.',
    'Projekte, Interessen oder ein eigener Abschnitt.',
    'Farbe, Schrift, Ränder: Passen Sie das Aussehen an.',
    'Ihr Lebenslauf ist fertig. Prüfen Sie die Vorschau und laden Sie ihn herunter.',
  ],
  recap: 'Übersicht', readyText: 'Das PDF entsteht auf Ihrem Gerät. Sie können Ihren Lebenslauf jederzeit wieder bearbeiten.',
  docsLink: 'Meine Dokumente ansehen',
}

const it: Guide = {
  mode: 'Modalità di modifica', guided: 'Guidata', full: 'Completa', stepsLabel: 'Passaggi', stepOf: 'Passaggio {n} di {total}', stepDone: 'fatto',
  prev: 'Indietro', next: 'Avanti', skip: 'Salta questo passaggio',
  steps: ['Modello', 'Identità', 'Profilo', 'Esperienza', 'Formazione', 'Competenze e lingue', 'Altre sezioni', 'Design', 'Scarica'],
  hints: [
    'Scegli un’impaginazione. Puoi cambiarla quando vuoi, i tuoi dati restano.',
    'Chi sei? Serve solo il nome, il resto è facoltativo.',
    'Due o tre frasi su chi sei e cosa cerchi.',
    'I tuoi impieghi, dal più recente al più vecchio. Un elenco puntato per riga nella descrizione.',
    'I tuoi titoli di studio e corsi.',
    'Cosa sai fare e le lingue che parli, con un livello se vuoi.',
    'Progetti, interessi o una sezione a tua scelta.',
    'Colore, carattere, margini: regola l’aspetto del documento.',
    'Il tuo CV è pronto. Controlla l’anteprima, poi scaricalo.',
  ],
  recap: 'Riepilogo', readyText: 'Il PDF viene creato sul tuo dispositivo. Puoi tornare a modificare il CV quando vuoi.',
  docsLink: 'Vedi i miei documenti',
}

const pt: Guide = {
  mode: 'Modo de edição', guided: 'Guiado', full: 'Completo', stepsLabel: 'Passos', stepOf: 'Passo {n} de {total}', stepDone: 'feito',
  prev: 'Anterior', next: 'Seguinte', skip: 'Saltar este passo',
  steps: ['Modelo', 'Identidade', 'Perfil', 'Experiência', 'Formação', 'Competências e línguas', 'Outras secções', 'Design', 'Transferir'],
  hints: [
    'Escolha um layout. Pode mudá-lo quando quiser, os seus dados ficam.',
    'Quem é? Só o nome é necessário, o resto é opcional.',
    'Duas ou três frases sobre quem é e o que procura.',
    'Os seus cargos, do mais recente ao mais antigo. Um marcador por linha na descrição.',
    'Os seus diplomas e formações.',
    'O que sabe fazer e as línguas que fala, com um nível se quiser.',
    'Projetos, interesses ou uma secção à sua escolha.',
    'Cor, tipo de letra, margens: ajuste o aspeto do documento.',
    'O seu CV está pronto. Veja a pré-visualização e transfira-o.',
  ],
  recap: 'Resumo', readyText: 'O PDF é criado no seu dispositivo. Pode voltar a editar o CV quando quiser.',
  docsLink: 'Ver os meus documentos',
}

const ar: Guide = {
  mode: 'وضع التحرير', guided: 'موجَّه', full: 'كامل', stepsLabel: 'الخطوات', stepOf: 'الخطوة {n} من {total}', stepDone: 'تمّت',
  prev: 'السابق', next: 'التالي', skip: 'تخطَّ هذه الخطوة',
  steps: ['القالب', 'الهوية', 'النبذة', 'الخبرة', 'التعليم', 'المهارات واللغات', 'أقسام أخرى', 'التصميم', 'التنزيل'],
  hints: [
    'اختر تصميمًا. يمكنك تغييره في أي وقت وستبقى معلوماتك كما هي.',
    'من أنت؟ الاسم وحده يكفي، والباقي اختياري.',
    'جملتان أو ثلاث عن هويتك وما تبحث عنه.',
    'وظائفك من الأحدث إلى الأقدم. نقطة واحدة في كل سطر في الوصف.',
    'شهاداتك ودوراتك.',
    'ما تُتقنه واللغات التي تتحدثها، مع مستوى إن أردت.',
    'مشاريع أو اهتمامات أو قسم من اختيارك.',
    'اللون والخط والهوامش: اضبط مظهر المستند.',
    'سيرتك الذاتية جاهزة. راجع المعاينة ثم نزّلها.',
  ],
  recap: 'الملخص', readyText: 'يُنشأ ملف PDF على جهازك. يمكنك العودة لتعديل سيرتك الذاتية متى شئت.',
  docsLink: 'عرض مستنداتي',
}

export const guide: Record<Lang, Guide> = { fr, en, es, de, it, pt, ar }
