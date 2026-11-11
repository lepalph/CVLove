import type { Lang } from '../model/types'

/** Mode guidé allégé : étape Modèle réduite à 6 vignettes, étapes Design et Télécharger réunies. */
export interface GuideLight {
  /** `{n}` = nombre total de modèles. */
  showAll: string
  showFew: string
  /** Dernière étape (design + téléchargement) : nom et indication. */
  lastStep: string
  lastHint: string
}

export const guideLight: Record<Lang, GuideLight> = {
  fr: { showAll: 'Voir les {n} modèles', showFew: 'Voir moins de modèles', lastStep: 'Design et téléchargement', lastHint: 'Ajustez l’aspect du document, vérifiez l’aperçu, puis téléchargez votre CV.' },
  en: { showAll: 'See all {n} templates', showFew: 'Show fewer templates', lastStep: 'Design and download', lastHint: 'Adjust the look, check the preview, then download your CV.' },
  es: { showAll: 'Ver las {n} plantillas', showFew: 'Ver menos plantillas', lastStep: 'Diseño y descarga', lastHint: 'Ajusta el aspecto, revisa la vista previa y descarga tu CV.' },
  de: { showAll: 'Alle {n} Vorlagen anzeigen', showFew: 'Weniger Vorlagen anzeigen', lastStep: 'Design und Download', lastHint: 'Passen Sie das Aussehen an, prüfen Sie die Vorschau und laden Sie Ihren Lebenslauf herunter.' },
  it: { showAll: 'Vedi tutti i {n} modelli', showFew: 'Mostra meno modelli', lastStep: 'Design e download', lastHint: 'Regola l’aspetto, controlla l’anteprima e scarica il tuo CV.' },
  pt: { showAll: 'Ver os {n} modelos', showFew: 'Ver menos modelos', lastStep: 'Design e transferência', lastHint: 'Ajuste o aspeto, confira a pré-visualização e transfira o seu CV.' },
  ar: { showAll: 'عرض كل القوالب الـ {n}', showFew: 'عرض قوالب أقل', lastStep: 'التصميم والتنزيل', lastHint: 'عدّل شكل المستند، وراجع المعاينة، ثم نزّل سيرتك الذاتية.' },
}
