import type { FontPair, Lang } from '../model/types'

// Données seules (sans react-pdf) : l'interface les lit pour le sélecteur de police sans charger le moteur PDF.
/** Paires de polices (OFL) : titres / texte. Seulement 400 et 700 : n'utiliser que ces graisses. */
export const FONT_PAIR_DEFS: Record<FontPair, { label: string; head: string; body: string }> = {
  inter: { label: 'Inter', head: 'Inter', body: 'Inter' },
  lora: { label: 'Lora + Inter', head: 'CVLoveSerif', body: 'Inter' },
  source: { label: 'Source Serif + Source Sans', head: 'SourceSerif4', body: 'CVLoveText' },
  playfair: { label: 'Playfair Display + Source Sans', head: 'CVLoveDisplay', body: 'CVLoveText' },
  montserrat: { label: 'Montserrat + Source Sans', head: 'Montserrat', body: 'CVLoveText' },
  livre: { label: 'Source Serif', head: 'SourceSerif4', body: 'SourceSerif4' },
}

/**
 * Police selon la paire et la langue : l'arabe utilise Tajawal partout (titres compris).
 * Pourquoi pas Noto Sans Arabic : react-pdf (fontkit 2.0.4) ne place pas correctement les points (marques GPOS
 * séparées par ccmp) de Noto : ج initial amputé, points de ي final décalés. Tajawal (points intégrés aux glyphes)
 * s'affiche correctement ; le chaînage des lettres et l'ordre RTL sont bons avec les deux.
 * Limite restante : le texte EXTRAIT du PDF arabe est incorrect (table ToUnicode de react-pdf) -> pas de
 * copier-coller ni d'ATS fiables en arabe. Rendu visuel OK.
 */
export const fontFor = (lang: Lang, role: 'head' | 'body', pair: FontPair) =>
  lang === 'ar' ? 'Tajawal' : FONT_PAIR_DEFS[pair][role]
