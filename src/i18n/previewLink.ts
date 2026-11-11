import type { Lang } from '../model/types'

/** Infobulle d'une ligne de l'aperçu reliée à son champ (survol à la souris) : le clic ouvre ce champ dans le formulaire. */
export const previewLink: Record<Lang, string> = {
  fr: 'Modifier dans le formulaire',
  en: 'Edit in the form',
  de: 'Im Formular bearbeiten',
  es: 'Editar en el formulario',
  it: 'Modifica nel modulo',
  pt: 'Editar no formulário',
  ar: 'التعديل في النموذج',
}
