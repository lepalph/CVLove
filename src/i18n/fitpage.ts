import type { Lang } from '../model/types'

/** Option « Tenir sur 1 page » du panneau Design : nom, et explication (marges, interligne et texte resserrés, texte à 90 %). */
export const fitPageText: Record<Lang, { label: string; hint: string }> = {
  fr: { label: 'Tenir sur 1 page', hint: 'Resserre les marges, l’interligne et le texte (environ 90 %) pour gagner une page.' },
  en: { label: 'Fit on 1 page', hint: 'Tightens margins, line spacing and text (about 90%) to save a page.' },
  de: { label: 'Auf 1 Seite halten', hint: 'Verkleinert Ränder, Zeilenabstand und Schrift (etwa 90 %), um eine Seite zu sparen.' },
  es: { label: 'Ajustar a 1 página', hint: 'Reduce márgenes, interlineado y texto (un 90 % aproximadamente) para ganar una página.' },
  it: { label: 'Stare in 1 pagina', hint: 'Riduce margini, interlinea e testo (circa il 90 %) per risparmiare una pagina.' },
  pt: { label: 'Caber em 1 página', hint: 'Reduz margens, espaçamento entre linhas e texto (cerca de 90 %) para ganhar uma página.' },
  ar: { label: 'احتواء السيرة في صفحة واحدة', hint: 'يقلّص الهوامش والمسافة بين الأسطر والنص (نحو 90٪) لتوفير صفحة.' },
}
