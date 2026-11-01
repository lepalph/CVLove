import type { Lang } from '../model/types'

/** Textes v2 de l'INTERFACE : Mes documents, panneau Design, niveaux. (Les libellés imprimés sur la feuille sont dans labels.ts.) */
export interface V2 {
  docs: string
  docsSub: string
  newCV: string
  open: string
  duplicate: string
  rename: string
  renameLabel: string
  del: string
  /** `{name}` est remplacé par le nom du document. */
  deleteConfirm: string
  exportDoc: string
  exportAll: string
  importFile: string
  importError: string
  kindCV: string
  kindLetter: string
  updated: string
  active: string
  design: string
  models: string
  category: string
  all: string
  cats: { classique: string; moderne: string; creatif: string; simple: string }
  columns: string
  oneCol: string
  twoCols: string
  photoFilter: string
  withPhoto: string
  withoutPhoto: string
  noModel: string
  customColor: string
  font: string
  fontScale: string
  lineHeight: string
  margins: string
  marginOpts: { compact: string; normal: string; large: string }
  pageSize: string
  photoShape: string
  shapes: { circle: string; rounded: string; square: string }
  skillDisplay: string
  displays: { text: string; bars: string; dots: string }
  level: string
  noLevel: string
  file: string
  importTitle: string
  /** `{name}` : nom du document en cours. */
  importReplace: string
  importAdd: string
  wipeAll: string
  wipeConfirm: string
}

const fr: V2 = {
  docs: 'Mes documents', docsSub: 'Vos CV, enregistrés dans ce navigateur. Exportez-les pour les garder ailleurs.',
  newCV: 'Nouveau CV', open: 'Ouvrir', duplicate: 'Dupliquer', rename: 'Renommer', renameLabel: 'Nom du document',
  del: 'Supprimer', deleteConfirm: 'Supprimer « {name} » ? Cette action est définitive.',
  exportDoc: 'Exporter', exportAll: 'Tout exporter (JSON)', importFile: 'Importer (JSON)', importError: 'Fichier illisible : ce n’est pas un export CVLove.',
  kindCV: 'CV', kindLetter: 'Lettre', updated: 'Modifié le', active: 'En cours d’édition',
  design: 'Design', models: 'Modèles', category: 'Catégorie', all: 'Tous',
  cats: { classique: 'Classique', moderne: 'Moderne', creatif: 'Créatif', simple: 'Simple' },
  columns: 'Colonnes', oneCol: '1 colonne', twoCols: '2 colonnes', photoFilter: 'Photo', withPhoto: 'Avec photo', withoutPhoto: 'Sans photo',
  noModel: 'Aucun modèle ne correspond à ces filtres.', customColor: 'Couleur libre', font: 'Police', fontScale: 'Taille du texte', lineHeight: 'Interligne',
  margins: 'Marges', marginOpts: { compact: 'Serrées', normal: 'Normales', large: 'Larges' }, pageSize: 'Format de page',
  photoShape: 'Forme de la photo', shapes: { circle: 'Rond', rounded: 'Arrondi', square: 'Carré' },
  skillDisplay: 'Affichage des niveaux', displays: { text: 'Texte', bars: 'Barres', dots: 'Points' }, level: 'Niveau', noLevel: 'Aucun',
  file: 'Fichier',
  importTitle: 'Importer ce fichier', importReplace: 'Remplacer « {name} »', importAdd: 'Ajouter comme nouveau document',
  wipeAll: 'Effacer toutes mes données', wipeConfirm: 'Effacer tous vos CV et lettres de ce navigateur ? Exportez-les d’abord si vous voulez les garder. Cette action est définitive.',
}

const en: V2 = {
  docs: 'My documents', docsSub: 'Your CVs, saved in this browser. Export them to keep a copy elsewhere.',
  newCV: 'New CV', open: 'Open', duplicate: 'Duplicate', rename: 'Rename', renameLabel: 'Document name',
  del: 'Delete', deleteConfirm: 'Delete “{name}”? This cannot be undone.',
  exportDoc: 'Export', exportAll: 'Export all (JSON)', importFile: 'Import (JSON)', importError: 'Unreadable file: this is not a CVLove export.',
  kindCV: 'CV', kindLetter: 'Letter', updated: 'Edited', active: 'Currently editing',
  design: 'Design', models: 'Templates', category: 'Category', all: 'All',
  cats: { classique: 'Classic', moderne: 'Modern', creatif: 'Creative', simple: 'Simple' },
  columns: 'Columns', oneCol: '1 column', twoCols: '2 columns', photoFilter: 'Photo', withPhoto: 'With photo', withoutPhoto: 'No photo',
  noModel: 'No template matches these filters.', customColor: 'Custom colour', font: 'Font', fontScale: 'Text size', lineHeight: 'Line spacing',
  margins: 'Margins', marginOpts: { compact: 'Tight', normal: 'Normal', large: 'Wide' }, pageSize: 'Page size',
  photoShape: 'Photo shape', shapes: { circle: 'Round', rounded: 'Rounded', square: 'Square' },
  skillDisplay: 'Level display', displays: { text: 'Text', bars: 'Bars', dots: 'Dots' }, level: 'Level', noLevel: 'None',
  file: 'File',
  importTitle: 'Import this file', importReplace: 'Replace “{name}”', importAdd: 'Add as a new document',
  wipeAll: 'Erase all my data', wipeConfirm: 'Erase all your CVs and letters from this browser? Export them first if you want to keep them. This cannot be undone.',
}

const es: V2 = {
  docs: 'Mis documentos', docsSub: 'Tus CV, guardados en este navegador. Expórtalos para conservarlos en otro sitio.',
  newCV: 'Nuevo CV', open: 'Abrir', duplicate: 'Duplicar', rename: 'Renombrar', renameLabel: 'Nombre del documento',
  del: 'Eliminar', deleteConfirm: '¿Eliminar «{name}»? Esta acción es definitiva.',
  exportDoc: 'Exportar', exportAll: 'Exportar todo (JSON)', importFile: 'Importar (JSON)', importError: 'Archivo ilegible: no es una exportación de CVLove.',
  kindCV: 'CV', kindLetter: 'Carta', updated: 'Modificado el', active: 'En edición',
  design: 'Diseño', models: 'Plantillas', category: 'Categoría', all: 'Todas',
  cats: { classique: 'Clásico', moderne: 'Moderno', creatif: 'Creativo', simple: 'Sencillo' },
  columns: 'Columnas', oneCol: '1 columna', twoCols: '2 columnas', photoFilter: 'Foto', withPhoto: 'Con foto', withoutPhoto: 'Sin foto',
  noModel: 'Ninguna plantilla coincide con estos filtros.', customColor: 'Color libre', font: 'Fuente', fontScale: 'Tamaño del texto', lineHeight: 'Interlineado',
  margins: 'Márgenes', marginOpts: { compact: 'Estrechos', normal: 'Normales', large: 'Amplios' }, pageSize: 'Formato de página',
  photoShape: 'Forma de la foto', shapes: { circle: 'Redonda', rounded: 'Redondeada', square: 'Cuadrada' },
  skillDisplay: 'Visualización de niveles', displays: { text: 'Texto', bars: 'Barras', dots: 'Puntos' }, level: 'Nivel', noLevel: 'Ninguno',
  file: 'Archivo',
  importTitle: 'Importar este archivo', importReplace: 'Reemplazar «{name}»', importAdd: 'Añadir como documento nuevo',
  wipeAll: 'Borrar todos mis datos', wipeConfirm: '¿Borrar todos sus CV y cartas de este navegador? Expórtelos antes si quiere conservarlos. Esta acción es definitiva.',
}

const de: V2 = {
  docs: 'Meine Dokumente', docsSub: 'Ihre Lebensläufe, gespeichert in diesem Browser. Exportieren Sie sie, um sie anderswo aufzubewahren.',
  newCV: 'Neuer Lebenslauf', open: 'Öffnen', duplicate: 'Duplizieren', rename: 'Umbenennen', renameLabel: 'Dokumentname',
  del: 'Löschen', deleteConfirm: '„{name}“ löschen? Das lässt sich nicht rückgängig machen.',
  exportDoc: 'Exportieren', exportAll: 'Alles exportieren (JSON)', importFile: 'Importieren (JSON)', importError: 'Datei nicht lesbar: Das ist kein CVLove-Export.',
  kindCV: 'Lebenslauf', kindLetter: 'Anschreiben', updated: 'Geändert am', active: 'In Bearbeitung',
  design: 'Design', models: 'Vorlagen', category: 'Kategorie', all: 'Alle',
  cats: { classique: 'Klassisch', moderne: 'Modern', creatif: 'Kreativ', simple: 'Schlicht' },
  columns: 'Spalten', oneCol: '1 Spalte', twoCols: '2 Spalten', photoFilter: 'Foto', withPhoto: 'Mit Foto', withoutPhoto: 'Ohne Foto',
  noModel: 'Keine Vorlage passt zu diesen Filtern.', customColor: 'Eigene Farbe', font: 'Schrift', fontScale: 'Textgröße', lineHeight: 'Zeilenabstand',
  margins: 'Ränder', marginOpts: { compact: 'Schmal', normal: 'Normal', large: 'Breit' }, pageSize: 'Seitenformat',
  photoShape: 'Fotoform', shapes: { circle: 'Rund', rounded: 'Abgerundet', square: 'Eckig' },
  skillDisplay: 'Darstellung der Stufen', displays: { text: 'Text', bars: 'Balken', dots: 'Punkte' }, level: 'Stufe', noLevel: 'Keine',
  file: 'Datei',
  importTitle: 'Diese Datei importieren', importReplace: '„{name}“ ersetzen', importAdd: 'Als neues Dokument hinzufügen',
  wipeAll: 'Alle meine Daten löschen', wipeConfirm: 'Alle Lebensläufe und Anschreiben aus diesem Browser löschen? Exportieren Sie sie vorher, wenn Sie sie behalten möchten. Dies ist endgültig.',
}

const it: V2 = {
  docs: 'I miei documenti', docsSub: 'I tuoi CV, salvati in questo browser. Esportali per conservarli altrove.',
  newCV: 'Nuovo CV', open: 'Apri', duplicate: 'Duplica', rename: 'Rinomina', renameLabel: 'Nome del documento',
  del: 'Elimina', deleteConfirm: 'Eliminare «{name}»? L’azione è definitiva.',
  exportDoc: 'Esporta', exportAll: 'Esporta tutto (JSON)', importFile: 'Importa (JSON)', importError: 'File illeggibile: non è un’esportazione di CVLove.',
  kindCV: 'CV', kindLetter: 'Lettera', updated: 'Modificato il', active: 'In modifica',
  design: 'Design', models: 'Modelli', category: 'Categoria', all: 'Tutti',
  cats: { classique: 'Classico', moderne: 'Moderno', creatif: 'Creativo', simple: 'Semplice' },
  columns: 'Colonne', oneCol: '1 colonna', twoCols: '2 colonne', photoFilter: 'Foto', withPhoto: 'Con foto', withoutPhoto: 'Senza foto',
  noModel: 'Nessun modello corrisponde a questi filtri.', customColor: 'Colore libero', font: 'Carattere', fontScale: 'Dimensione del testo', lineHeight: 'Interlinea',
  margins: 'Margini', marginOpts: { compact: 'Stretti', normal: 'Normali', large: 'Ampi' }, pageSize: 'Formato pagina',
  photoShape: 'Forma della foto', shapes: { circle: 'Tonda', rounded: 'Arrotondata', square: 'Quadrata' },
  skillDisplay: 'Visualizzazione dei livelli', displays: { text: 'Testo', bars: 'Barre', dots: 'Punti' }, level: 'Livello', noLevel: 'Nessuno',
  file: 'File',
  importTitle: 'Importa questo file', importReplace: 'Sostituisci «{name}»', importAdd: 'Aggiungi come nuovo documento',
  wipeAll: 'Cancella tutti i miei dati', wipeConfirm: 'Cancellare tutti i CV e le lettere da questo browser? Esportali prima se vuoi conservarli. L’azione è definitiva.',
}

const pt: V2 = {
  docs: 'Os meus documentos', docsSub: 'Os seus CV, guardados neste navegador. Exporte-os para os guardar noutro lugar.',
  newCV: 'Novo CV', open: 'Abrir', duplicate: 'Duplicar', rename: 'Renomear', renameLabel: 'Nome do documento',
  del: 'Eliminar', deleteConfirm: 'Eliminar «{name}»? Esta ação é definitiva.',
  exportDoc: 'Exportar', exportAll: 'Exportar tudo (JSON)', importFile: 'Importar (JSON)', importError: 'Ficheiro ilegível: não é uma exportação do CVLove.',
  kindCV: 'CV', kindLetter: 'Carta', updated: 'Alterado em', active: 'Em edição',
  design: 'Design', models: 'Modelos', category: 'Categoria', all: 'Todos',
  cats: { classique: 'Clássico', moderne: 'Moderno', creatif: 'Criativo', simple: 'Simples' },
  columns: 'Colunas', oneCol: '1 coluna', twoCols: '2 colunas', photoFilter: 'Foto', withPhoto: 'Com foto', withoutPhoto: 'Sem foto',
  noModel: 'Nenhum modelo corresponde a estes filtros.', customColor: 'Cor livre', font: 'Tipo de letra', fontScale: 'Tamanho do texto', lineHeight: 'Espaçamento entre linhas',
  margins: 'Margens', marginOpts: { compact: 'Estreitas', normal: 'Normais', large: 'Largas' }, pageSize: 'Formato da página',
  photoShape: 'Forma da foto', shapes: { circle: 'Redonda', rounded: 'Arredondada', square: 'Quadrada' },
  skillDisplay: 'Apresentação dos níveis', displays: { text: 'Texto', bars: 'Barras', dots: 'Pontos' }, level: 'Nível', noLevel: 'Nenhum',
  file: 'Ficheiro',
  importTitle: 'Importar este ficheiro', importReplace: 'Substituir «{name}»', importAdd: 'Adicionar como novo documento',
  wipeAll: 'Apagar todos os meus dados', wipeConfirm: 'Apagar todos os seus CV e cartas deste navegador? Exporte-os antes se os quiser guardar. Esta ação é definitiva.',
}

const ar: V2 = {
  docs: 'مستنداتي', docsSub: 'سيَرك الذاتية محفوظة في هذا المتصفح. صدّرها للاحتفاظ بنسخة في مكان آخر.',
  newCV: 'سيرة ذاتية جديدة', open: 'فتح', duplicate: 'نسخ', rename: 'إعادة تسمية', renameLabel: 'اسم المستند',
  del: 'حذف', deleteConfirm: 'هل تريد حذف «{name}»؟ لا يمكن التراجع عن هذا الإجراء.',
  exportDoc: 'تصدير', exportAll: 'تصدير الكل (JSON)', importFile: 'استيراد (JSON)', importError: 'ملف غير قابل للقراءة: ليس ملف تصدير من CVLove.',
  kindCV: 'سيرة ذاتية', kindLetter: 'رسالة', updated: 'آخر تعديل', active: 'قيد التحرير',
  design: 'التصميم', models: 'القوالب', category: 'الفئة', all: 'الكل',
  cats: { classique: 'كلاسيكي', moderne: 'عصري', creatif: 'إبداعي', simple: 'بسيط' },
  columns: 'الأعمدة', oneCol: 'عمود واحد', twoCols: 'عمودان', photoFilter: 'الصورة', withPhoto: 'مع صورة', withoutPhoto: 'بدون صورة',
  noModel: 'لا يوجد قالب يطابق هذه المرشحات.', customColor: 'لون حر', font: 'الخط', fontScale: 'حجم النص', lineHeight: 'تباعد الأسطر',
  margins: 'الهوامش', marginOpts: { compact: 'ضيقة', normal: 'عادية', large: 'واسعة' }, pageSize: 'حجم الصفحة',
  photoShape: 'شكل الصورة', shapes: { circle: 'دائري', rounded: 'مستدير الزوايا', square: 'مربع' },
  skillDisplay: 'عرض المستويات', displays: { text: 'نص', bars: 'أشرطة', dots: 'نقاط' }, level: 'المستوى', noLevel: 'بدون',
  file: 'ملف',
  importTitle: 'استيراد هذا الملف', importReplace: 'استبدال «{name}»', importAdd: 'إضافة كمستند جديد',
  wipeAll: 'مسح كل بياناتي', wipeConfirm: 'مسح كل سيرك الذاتية ورسائلك من هذا المتصفح؟ صدّرها أولًا إن أردت الاحتفاظ بها. لا يمكن التراجع عن هذا الإجراء.',
}

export const v2: Record<Lang, V2> = { fr, en, es, de, it, pt, ar }
