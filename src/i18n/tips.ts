import type { Lang } from '../model/types'

/** Textes ajoutés par le lot 1A : conseils par étape du mode guidé, modèle choisi, confirmation de téléchargement, nombre de pages. */
export interface Tips {
  /** `{name}` = nom du modèle. */
  chosen: string
  /** `{file}` = nom du fichier. */
  saved: string
  /** `{n}` = nombre de pages. */
  pages: string
  /** Bouton de saut vers une page de l'aperçu. */
  page: string
  /** Un conseil par étape, dans l'ordre de STEPS (ui/Guided.tsx) ; vide = pas de conseil. */
  steps: string[]
}

const t = (identity: string, profile: string, experience: string, education: string, skills: string, others: string): string[] =>
  ['', identity, profile, experience, education, skills, others, '', '']

const fr: Tips = {
  chosen: 'Modèle choisi : {name}', saved: 'PDF enregistré : {file}', pages: '{n} pages', page: 'Page {n}',
  steps: t(
    'Un prénom, un nom, un e-mail et un téléphone suffisent pour commencer. Vous pourrez compléter plus tard.',
    'Exemple à adapter : « Étudiante motivée, je cherche un premier emploi dans la vente. Je suis sérieuse, ponctuelle et j’aime le contact avec les gens. »',
    'Pas encore d’emploi ? Un baby-sitting, un job d’été, un stage ou du bénévolat comptent.',
    'Indiquez votre diplôme le plus récent en premier. Un stage ou une formation courte y a aussi sa place.',
    'Regroupez par catégories, par exemple Savoir-être, Outils, Langues.',
    'Facultatif : projets, centres d’intérêt, permis, associations. Ce qui vous distingue peut compter.',
  ),
}
const en: Tips = {
  chosen: 'Chosen template: {name}', saved: 'PDF saved: {file}', pages: '{n} pages', page: 'Page {n}',
  steps: t(
    'A first name, a last name, an email and a phone number are enough to start. You can add more later.',
    'Example to adapt: “Motivated student looking for a first job in retail. I am reliable, punctual and enjoy working with people.”',
    'No job yet? Babysitting, a summer job, an internship or volunteering all count.',
    'Put your most recent qualification first. An internship or a short course belongs here too.',
    'Group them by category, for example Soft skills, Tools, Languages.',
    'Optional: projects, interests, driving licence, clubs. What sets you apart can matter.',
  ),
}
const es: Tips = {
  chosen: 'Plantilla elegida: {name}', saved: 'PDF guardado: {file}', pages: '{n} páginas', page: 'Página {n}',
  steps: t(
    'Un nombre, un apellido, un correo y un teléfono bastan para empezar. Podrá completar el resto más tarde.',
    'Ejemplo para adaptar: «Estudiante motivada, busco mi primer empleo en ventas. Soy responsable, puntual y me gusta tratar con la gente.»',
    '¿Todavía sin empleo? Cuidar niños, un trabajo de verano, unas prácticas o un voluntariado cuentan.',
    'Ponga primero su título más reciente. Unas prácticas o un curso corto también tienen cabida.',
    'Agrúpelas por categorías, por ejemplo Habilidades personales, Herramientas, Idiomas.',
    'Opcional: proyectos, intereses, carné de conducir, asociaciones. Lo que le distingue puede contar.',
  ),
}
const de: Tips = {
  chosen: 'Gewählte Vorlage: {name}', saved: 'PDF gespeichert: {file}', pages: '{n} Seiten', page: 'Seite {n}',
  steps: t(
    'Vorname, Nachname, E-Mail und Telefonnummer reichen für den Anfang. Den Rest können Sie später ergänzen.',
    'Beispiel zum Anpassen: „Motivierte Studentin auf der Suche nach dem ersten Job im Verkauf. Ich bin zuverlässig, pünktlich und mag den Kontakt mit Menschen.“',
    'Noch keine Stelle? Babysitten, ein Ferienjob, ein Praktikum oder ehrenamtliche Arbeit zählen auch.',
    'Nennen Sie den neuesten Abschluss zuerst. Ein Praktikum oder ein kurzer Kurs gehört auch hierher.',
    'Fassen Sie sie in Kategorien zusammen, zum Beispiel Soziale Kompetenzen, Werkzeuge, Sprachen.',
    'Freiwillig: Projekte, Interessen, Führerschein, Vereine. Was Sie auszeichnet, kann zählen.',
  ),
}
const it: Tips = {
  chosen: 'Modello scelto: {name}', saved: 'PDF salvato: {file}', pages: '{n} pagine', page: 'Pagina {n}',
  steps: t(
    'Nome, cognome, e-mail e telefono bastano per iniziare. Potrà completare il resto più tardi.',
    'Esempio da adattare: «Studentessa motivata, cerco il mio primo lavoro nelle vendite. Sono seria, puntuale e mi piace stare con le persone.»',
    'Ancora nessun lavoro? Un babysitting, un lavoretto estivo, uno stage o il volontariato contano.',
    'Metta per primo il titolo più recente. Anche uno stage o un corso breve trovano posto qui.',
    'Le raggruppi per categorie, ad esempio Soft skill, Strumenti, Lingue.',
    'Facoltativo: progetti, interessi, patente, associazioni. Ciò che la distingue può contare.',
  ),
}
const pt: Tips = {
  chosen: 'Modelo escolhido: {name}', saved: 'PDF guardado: {file}', pages: '{n} páginas', page: 'Página {n}',
  steps: t(
    'Um nome, um apelido, um e-mail e um telefone bastam para começar. Pode completar o resto mais tarde.',
    'Exemplo para adaptar: «Estudante motivada, procuro o meu primeiro emprego em vendas. Sou séria, pontual e gosto do contacto com as pessoas.»',
    'Ainda sem emprego? Um trabalho de baby-sitting, um emprego de verão, um estágio ou voluntariado contam.',
    'Coloque primeiro a formação mais recente. Um estágio ou um curso curto também cabe aqui.',
    'Agrupe por categorias, por exemplo Competências pessoais, Ferramentas, Idiomas.',
    'Opcional: projetos, interesses, carta de condução, associações. O que o distingue pode contar.',
  ),
}
const ar: Tips = {
  chosen: 'القالب المختار: {name}', saved: 'تم حفظ ملف PDF: {file}', pages: '{n} صفحات', page: 'الصفحة {n}',
  steps: t(
    'يكفي الاسم الأول واسم العائلة والبريد الإلكتروني والهاتف للبداية. يمكنك إكمال الباقي لاحقًا.',
    'مثال يمكنك تعديله: «طالبة مجتهدة أبحث عن أول وظيفة في المبيعات. أنا جادة وملتزمة بالمواعيد وأحب التعامل مع الناس.»',
    'ليست لديك وظيفة بعد؟ رعاية الأطفال أو عمل صيفي أو تدريب أو تطوع، كلها تُحتسب.',
    'اكتب أحدث شهادة لديك أولًا. ويمكن إضافة تدريب أو دورة قصيرة هنا أيضًا.',
    'اجمعها في فئات، مثل المهارات الشخصية والأدوات واللغات.',
    'اختياري: مشاريع، اهتمامات، رخصة قيادة، جمعيات. ما يميّزك قد يكون مهمًا.',
  ),
}

export const tips: Record<Lang, Tips> = { fr, en, es, de, it, pt, ar }
