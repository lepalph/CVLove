import type { Lang } from '../model/types'

/** Mes documents : état vide, pastille « Exemple » (CV rempli avec les données d'exemple). */
export const documentsList: Record<Lang, { empty: string; example: string }> = {
  fr: { empty: 'Aucun document pour l’instant. Cliquez sur « Nouveau CV » pour commencer, ou importez un fichier JSON déjà exporté.', example: 'Exemple' },
  en: { empty: 'No documents yet. Click “New CV” to start, or import a JSON file you exported earlier.', example: 'Example' },
  de: { empty: 'Noch keine Dokumente. Klicken Sie auf „Neuer Lebenslauf“, um zu beginnen, oder importieren Sie eine zuvor exportierte JSON-Datei.', example: 'Beispiel' },
  es: { empty: 'Aún no hay documentos. Pulsa «Nuevo CV» para empezar, o importa un archivo JSON que ya hayas exportado.', example: 'Ejemplo' },
  it: { empty: 'Nessun documento per ora. Fai clic su «Nuovo CV» per iniziare, oppure importa un file JSON esportato in precedenza.', example: 'Esempio' },
  pt: { empty: 'Ainda não há documentos. Clique em «Novo CV» para começar, ou importe um ficheiro JSON que já exportou.', example: 'Exemplo' },
  ar: { empty: 'لا توجد مستندات بعد. اضغط على «سيرة ذاتية جديدة» للبدء، أو استورد ملف JSON سبق أن صدّرته.', example: 'مثال' },
}
