import { Font } from '@react-pdf/renderer'

/** Familles (TTF statiques 400 + 700, générées par scripts/make-fonts.py : `<fichier>-Regular.ttf` / `-Bold.ttf`). */
const FILES: Record<string, string> = {
  Inter: 'Inter', CVLoveSerif: 'CVLoveSerif', SourceSerif4: 'SourceSerif4', CVLoveText: 'CVLoveText',
  CVLoveDisplay: 'CVLoveDisplay', Montserrat: 'Montserrat', Tajawal: 'Tajawal',
}

/**
 * `base` : préfixe d'URL (navigateur) ou chemin disque (Node, check:pdf).
 * Césure désactivée (sinon coupures sauvages, surtout en arabe).
 */
let done = false
export function registerFonts(base: string) {
  if (done) return
  done = true
  for (const [family, file] of Object.entries(FILES))
    Font.register({ family, fonts: [{ src: `${base}${file}-Regular.ttf`, fontWeight: 400 }, { src: `${base}${file}-Bold.ttf`, fontWeight: 700 }] })
  Font.registerHyphenationCallback((w) => [w])
}
