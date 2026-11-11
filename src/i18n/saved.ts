import type { Lang } from '../model/types'

/** Témoin discret de l'en-tête de l'éditeur, après une écriture réussie dans localStorage. */
export const saved: Record<Lang, string> = {
  fr: 'Enregistré sur cet appareil',
  en: 'Saved on this device',
  de: 'Auf diesem Gerät gespeichert',
  es: 'Guardado en este dispositivo',
  it: 'Salvato su questo dispositivo',
  pt: 'Guardado neste dispositivo',
  ar: 'تم الحفظ على هذا الجهاز',
}
