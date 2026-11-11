import type { Lang } from '../model/types'

/** Tiroir de réglages de l'onglet Aperçu (mobile) : bouton d'ouverture, titre du tiroir, bouton de fermeture, nom du choix de modèle. */
export const previewSettings: Record<Lang, { open: string; title: string; close: string; model: string }> = {
  fr: { open: 'Réglages', title: 'Réglages du CV', close: 'Fermer', model: 'Modèle' },
  en: { open: 'Settings', title: 'CV settings', close: 'Close', model: 'Template' },
  de: { open: 'Einstellungen', title: 'Einstellungen des Lebenslaufs', close: 'Schließen', model: 'Vorlage' },
  es: { open: 'Ajustes', title: 'Ajustes del CV', close: 'Cerrar', model: 'Plantilla' },
  it: { open: 'Impostazioni', title: 'Impostazioni del CV', close: 'Chiudi', model: 'Modello' },
  pt: { open: 'Ajustes', title: 'Ajustes do CV', close: 'Fechar', model: 'Modelo' },
  ar: { open: 'الإعدادات', title: 'إعدادات السيرة الذاتية', close: 'إغلاق', model: 'القالب' },
}
