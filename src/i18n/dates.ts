import type { Lang } from '../model/types'

/** Textes de l'INTERFACE pour la saisie d'une date en un seul champ (début et fin d'une expérience ou d'une formation). */
export interface DatesText {
  /** Aide à la saisie, MM/AAAA dans la langue. */
  placeholder: string
  /** Erreur sous le champ quand le texte n'est pas une date. */
  invalid: string
  /** Erreur sous le champ « fin » quand elle précède le début. */
  beforeStart: string
}

export const datesText: Record<Lang, DatesText> = {
  fr: { placeholder: 'MM/AAAA', invalid: 'Date non reconnue. Essayez 03/2021, mars 2021 ou 2021.', beforeStart: 'La fin ne peut pas précéder le début.' },
  en: { placeholder: 'MM/YYYY', invalid: 'Date not recognised. Try 03/2021, March 2021 or 2021.', beforeStart: 'The end cannot be before the start.' },
  de: { placeholder: 'MM/JJJJ', invalid: 'Datum nicht erkannt. Versuchen Sie 03/2021, März 2021 oder 2021.', beforeStart: 'Das Ende darf nicht vor dem Beginn liegen.' },
  es: { placeholder: 'MM/AAAA', invalid: 'Fecha no reconocida. Pruebe 03/2021, marzo 2021 o 2021.', beforeStart: 'El final no puede ser anterior al inicio.' },
  it: { placeholder: 'MM/AAAA', invalid: 'Data non riconosciuta. Provi 03/2021, marzo 2021 o 2021.', beforeStart: 'La fine non può precedere l’inizio.' },
  pt: { placeholder: 'MM/AAAA', invalid: 'Data não reconhecida. Experimente 03/2021, março 2021 ou 2021.', beforeStart: 'O fim não pode ser anterior ao início.' },
  ar: { placeholder: 'شهر/سنة', invalid: 'التاريخ غير مفهوم. جرّب 03/2021 أو مارس 2021 أو 2021.', beforeStart: 'لا يمكن أن تسبق النهاية البداية.' },
}
