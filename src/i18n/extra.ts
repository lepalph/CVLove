import type { Lang } from '../model/types'

/** Textes de l'INTERFACE ajoutés par la passe v2 : accessibilité, compteur « 0 requête », état vide, aperçu. Les marqueurs `{x}` sont remplacés. */
export interface Extra {
  skip: string
  /** `{name}` = modèle. */
  modelApplied: string
  /** `{name}` = couleur. */
  colorApplied: string
  /** `{file}` = nom du fichier. */
  downloaded: string
  /** `{model}` et `{who}`. */
  previewAlt: string
  emptyPreview: string
  /** Étiquette posée sur l'aperçu quand un CV vide montre l'exemple. */
  samplePreview: string
  zoom: string
  /** Noms des 7 accents proposés, dans l'ordre de ACCENTS. */
  colors: string[]
  /** `{n}` = nombre de requêtes vers une autre origine. */
  netOne: string
  netMany: string
  netHow: string
  netHelp: string
  exampleBanner: string
  startEmpty: string
  visibilityHint: string
  /** `{n}`. */
  imported: string
  fileImported: string
  /** Bandeau d'erreur de sauvegarde (stockage plein / indisponible) et son bouton. */
  saveQuota: string
  saveUnavailable: string
  exportMine: string
  /** `{mb}` = taille maximale. */
  tooBig: string
  photoError: string
  /** Nom d'un nouveau CV tant que la personne n'a pas saisi son nom. */
  untitled: string
}

const fr: Extra = {
  skip: 'Aller au contenu',
  modelApplied: 'Modèle {name} appliqué', colorApplied: 'Couleur {name} appliquée', downloaded: 'PDF téléchargé : {file}',
  previewAlt: 'Aperçu du document, modèle {model}. {who}', emptyPreview: 'Votre document est vide. Remplissez l’étape Identité : l’aperçu se construit au fil de la saisie.', samplePreview: 'Exemple. Vos informations le remplacent dès que vous commencez à écrire.',
  zoom: 'Agrandir l’aperçu',
  colors: ['Orange brûlé', 'Bleu', 'Vert', 'Violet', 'Rose', 'Turquoise', 'Ardoise'],
  netOne: '{n} requête vers un autre site', netMany: '{n} requêtes vers d’autres sites', netHow: 'Comment le vérifier',
  netHelp: 'Ouvrez les outils du navigateur (F12, ou Cmd+Option+I sur Mac), onglet Réseau, puis rechargez la page : toutes les lignes viennent de cette adresse. Ce compteur lit la même liste, en direct.',
  exampleBanner: 'Ce document contient l’exemple de {name}. Remplacez-le avant de télécharger, ou partez d’une page vide.',
  startEmpty: 'Partir d’une page vide',
  visibilityHint: 'Masquer garde la section pour plus tard sans l’imprimer. Supprimer l’efface.',
  imported: '{n} document(s) importé(s).', fileImported: 'Fichier importé.',
  saveQuota: 'Stockage du navigateur plein : vos dernières modifications ne sont pas enregistrées. Exportez vos documents avant de fermer la page.', saveUnavailable: 'Enregistrement impossible sur cet appareil (navigation privée ou stockage bloqué). Exportez vos documents avant de fermer la page.', exportMine: 'Exporter mes documents',
  tooBig: 'Fichier trop volumineux (maximum {mb} Mo).', photoError: 'Image illisible : essayez un fichier JPEG ou PNG.', untitled: 'CV sans titre',
}
const en: Extra = {
  skip: 'Skip to content',
  modelApplied: 'Template {name} applied', colorApplied: 'Colour {name} applied', downloaded: 'PDF downloaded: {file}',
  previewAlt: 'Document preview, template {model}. {who}', emptyPreview: 'Your document is empty. Fill in the Identity step: the preview builds as you type.', samplePreview: 'Sample. Your details replace it as soon as you start typing.',
  zoom: 'Enlarge the preview',
  colors: ['Burnt orange', 'Blue', 'Green', 'Purple', 'Pink', 'Teal', 'Slate'],
  netOne: '{n} request to another site', netMany: '{n} requests to other sites', netHow: 'How to check',
  netHelp: 'Open your browser tools (F12, or Cmd+Option+I on Mac), go to the Network tab, then reload the page: every line comes from this address. This counter reads the same list, live.',
  exampleBanner: 'This document holds the sample for {name}. Replace it before downloading, or start from a blank page.',
  startEmpty: 'Start from a blank page',
  visibilityHint: 'Hide keeps the section for later without printing it. Delete erases it.',
  imported: '{n} document(s) imported.', fileImported: 'File imported.',
  saveQuota: 'Browser storage is full: your latest changes are not saved. Export your documents before closing the page.', saveUnavailable: 'Saving is not possible on this device (private browsing or blocked storage). Export your documents before closing the page.', exportMine: 'Export my documents',
  tooBig: 'File too large (maximum {mb} MB).', photoError: 'Unreadable image: try a JPEG or PNG file.', untitled: 'Untitled résumé',
}
const es: Extra = {
  skip: 'Ir al contenido',
  modelApplied: 'Plantilla {name} aplicada', colorApplied: 'Color {name} aplicado', downloaded: 'PDF descargado: {file}',
  previewAlt: 'Vista previa del documento, plantilla {model}. {who}', emptyPreview: 'Tu documento está vacío. Rellena el paso Identidad: la vista previa se construye mientras escribes.', samplePreview: 'Ejemplo. Tus datos lo sustituyen en cuanto empiezas a escribir.',
  zoom: 'Ampliar la vista previa',
  colors: ['Naranja tostado', 'Azul', 'Verde', 'Violeta', 'Rosa', 'Turquesa', 'Pizarra'],
  netOne: '{n} solicitud a otro sitio', netMany: '{n} solicitudes a otros sitios', netHow: 'Cómo comprobarlo',
  netHelp: 'Abre las herramientas del navegador (F12, o Cmd+Opción+I en Mac), pestaña Red, y recarga la página: todas las líneas vienen de esta dirección. Este contador lee la misma lista, en directo.',
  exampleBanner: 'Este documento contiene el ejemplo de {name}. Sustitúyelo antes de descargar, o empieza con una página en blanco.',
  startEmpty: 'Empezar con una página en blanco',
  visibilityHint: 'Ocultar guarda la sección para más tarde sin imprimirla. Eliminar la borra.',
  imported: '{n} documento(s) importado(s).', fileImported: 'Archivo importado.',
  saveQuota: 'Almacenamiento del navegador lleno: tus últimos cambios no se guardan. Exporta tus documentos antes de cerrar la página.', saveUnavailable: 'No se puede guardar en este dispositivo (navegación privada o almacenamiento bloqueado). Exporta tus documentos antes de cerrar la página.', exportMine: 'Exportar mis documentos',
  tooBig: 'Archivo demasiado grande (máximo {mb} MB).', photoError: 'Imagen ilegible: prueba con un archivo JPEG o PNG.', untitled: 'CV sin título',
}
const de: Extra = {
  skip: 'Zum Inhalt springen',
  modelApplied: 'Vorlage {name} angewendet', colorApplied: 'Farbe {name} angewendet', downloaded: 'PDF heruntergeladen: {file}',
  previewAlt: 'Dokumentvorschau, Vorlage {model}. {who}', emptyPreview: 'Ihr Dokument ist leer. Füllen Sie den Schritt Identität aus: Die Vorschau entsteht beim Tippen.', samplePreview: 'Beispiel. Ihre Angaben ersetzen es, sobald Sie zu schreiben beginnen.',
  zoom: 'Vorschau vergrößern',
  colors: ['Gebranntes Orange', 'Blau', 'Grün', 'Violett', 'Rosa', 'Türkis', 'Schiefer'],
  netOne: '{n} Anfrage an eine andere Website', netMany: '{n} Anfragen an andere Websites', netHow: 'So prüfen Sie es',
  netHelp: 'Öffnen Sie die Browser-Werkzeuge (F12, auf dem Mac Cmd+Option+I), Reiter Netzwerk, und laden Sie die Seite neu: Alle Zeilen stammen von dieser Adresse. Dieser Zähler liest dieselbe Liste, live.',
  exampleBanner: 'Dieses Dokument enthält das Beispiel von {name}. Ersetzen Sie es vor dem Download oder starten Sie mit einer leeren Seite.',
  startEmpty: 'Mit leerer Seite beginnen',
  visibilityHint: 'Ausblenden hebt den Abschnitt auf, ohne ihn zu drucken. Löschen entfernt ihn.',
  imported: '{n} Dokument(e) importiert.', fileImported: 'Datei importiert.',
  saveQuota: 'Browser-Speicher voll: Ihre letzten Änderungen sind nicht gespeichert. Exportieren Sie Ihre Dokumente, bevor Sie die Seite schließen.', saveUnavailable: 'Speichern auf diesem Gerät nicht möglich (privater Modus oder gesperrter Speicher). Exportieren Sie Ihre Dokumente, bevor Sie die Seite schließen.', exportMine: 'Meine Dokumente exportieren',
  tooBig: 'Datei zu groß (maximal {mb} MB).', photoError: 'Bild nicht lesbar: Versuchen Sie eine JPEG- oder PNG-Datei.', untitled: 'Lebenslauf ohne Titel',
}
const it: Extra = {
  skip: 'Vai al contenuto',
  modelApplied: 'Modello {name} applicato', colorApplied: 'Colore {name} applicato', downloaded: 'PDF scaricato: {file}',
  previewAlt: 'Anteprima del documento, modello {model}. {who}', emptyPreview: 'Il documento è vuoto. Compila il passo Identità: l’anteprima si costruisce mentre scrivi.', samplePreview: 'Esempio. I tuoi dati lo sostituiscono appena inizi a scrivere.',
  zoom: 'Ingrandisci l’anteprima',
  colors: ['Arancio bruciato', 'Blu', 'Verde', 'Viola', 'Rosa', 'Turchese', 'Ardesia'],
  netOne: '{n} richiesta verso un altro sito', netMany: '{n} richieste verso altri siti', netHow: 'Come verificarlo',
  netHelp: 'Apri gli strumenti del browser (F12, o Cmd+Opzione+I su Mac), scheda Rete, poi ricarica la pagina: tutte le righe arrivano da questo indirizzo. Questo contatore legge lo stesso elenco, in diretta.',
  exampleBanner: 'Questo documento contiene l’esempio di {name}. Sostituiscilo prima di scaricare, oppure parti da una pagina vuota.',
  startEmpty: 'Parti da una pagina vuota',
  visibilityHint: 'Nascondi conserva la sezione per dopo senza stamparla. Elimina la cancella.',
  imported: '{n} documento/i importato/i.', fileImported: 'File importato.',
  saveQuota: 'Memoria del browser piena: le ultime modifiche non sono salvate. Esporta i documenti prima di chiudere la pagina.', saveUnavailable: 'Salvataggio impossibile su questo dispositivo (navigazione privata o archiviazione bloccata). Esporta i documenti prima di chiudere la pagina.', exportMine: 'Esporta i miei documenti',
  tooBig: 'File troppo grande (massimo {mb} MB).', photoError: 'Immagine illeggibile: prova con un file JPEG o PNG.', untitled: 'CV senza titolo',
}
const pt: Extra = {
  skip: 'Ir para o conteúdo',
  modelApplied: 'Modelo {name} aplicado', colorApplied: 'Cor {name} aplicada', downloaded: 'PDF descarregado: {file}',
  previewAlt: 'Pré-visualização do documento, modelo {model}. {who}', emptyPreview: 'O documento está vazio. Preencha o passo Identidade: a pré-visualização constrói-se enquanto escreve.', samplePreview: 'Exemplo. Os seus dados substituem-no assim que começar a escrever.',
  zoom: 'Ampliar a pré-visualização',
  colors: ['Laranja queimado', 'Azul', 'Verde', 'Violeta', 'Rosa', 'Turquesa', 'Ardósia'],
  netOne: '{n} pedido a outro site', netMany: '{n} pedidos a outros sites', netHow: 'Como verificar',
  netHelp: 'Abra as ferramentas do navegador (F12, ou Cmd+Option+I no Mac), separador Rede, e recarregue a página: todas as linhas vêm deste endereço. Este contador lê a mesma lista, em direto.',
  exampleBanner: 'Este documento contém o exemplo de {name}. Substitua-o antes de descarregar, ou comece com uma página em branco.',
  startEmpty: 'Começar com uma página em branco',
  visibilityHint: 'Ocultar guarda a secção para mais tarde sem a imprimir. Eliminar apaga-a.',
  imported: '{n} documento(s) importado(s).', fileImported: 'Ficheiro importado.',
  saveQuota: 'Armazenamento do navegador cheio: as suas últimas alterações não estão guardadas. Exporte os documentos antes de fechar a página.', saveUnavailable: 'Não é possível guardar neste dispositivo (navegação privada ou armazenamento bloqueado). Exporte os documentos antes de fechar a página.', exportMine: 'Exportar os meus documentos',
  tooBig: 'Ficheiro demasiado grande (máximo {mb} MB).', photoError: 'Imagem ilegível: tente um ficheiro JPEG ou PNG.', untitled: 'CV sem título',
}
const ar: Extra = {
  skip: 'انتقل إلى المحتوى',
  modelApplied: 'تم تطبيق القالب {name}', colorApplied: 'تم تطبيق اللون {name}', downloaded: 'تم تنزيل ملف PDF: {file}',
  previewAlt: 'معاينة المستند، القالب {model}. {who}', emptyPreview: 'مستندك فارغ. املأ خطوة الهوية: تُبنى المعاينة أثناء الكتابة.', samplePreview: 'مثال. تحلّ بياناتك محلّه بمجرد أن تبدأ الكتابة.',
  zoom: 'تكبير المعاينة',
  colors: ['برتقالي محروق', 'أزرق', 'أخضر', 'بنفسجي', 'وردي', 'فيروزي', 'رمادي أردوازي'],
  netOne: '{n} طلب إلى موقع آخر', netMany: '{n} طلبات إلى مواقع أخرى', netHow: 'كيف تتحقق',
  netHelp: 'افتح أدوات المتصفح (F12، أو Cmd+Option+I على ماك)، ثم تبويب الشبكة، وأعد تحميل الصفحة: كل الأسطر تأتي من هذا العنوان. يقرأ هذا العداد القائمة نفسها مباشرة.',
  exampleBanner: 'يحتوي هذا المستند على مثال {name}. استبدله قبل التنزيل، أو ابدأ بصفحة فارغة.',
  startEmpty: 'ابدأ بصفحة فارغة',
  visibilityHint: 'الإخفاء يبقي القسم لوقت لاحق دون طباعته. الحذف يمسحه.',
  imported: 'تم استيراد {n} مستند.', fileImported: 'تم استيراد الملف.',
  saveQuota: 'مساحة تخزين المتصفح ممتلئة: آخر تعديلاتك غير محفوظة. صدّر مستنداتك قبل إغلاق الصفحة.', saveUnavailable: 'تعذّر الحفظ على هذا الجهاز (تصفح خاص أو تخزين محظور). صدّر مستنداتك قبل إغلاق الصفحة.', exportMine: 'تصدير مستنداتي',
  tooBig: 'الملف كبير جدًا (الحد الأقصى {mb} ميغابايت).', photoError: 'صورة غير قابلة للقراءة: جرّب ملف JPEG أو PNG.', untitled: 'سيرة ذاتية بلا عنوان',
}

export const extra: Record<Lang, Extra> = { fr, en, es, de, it, pt, ar }
