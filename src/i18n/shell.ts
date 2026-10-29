import type { Lang } from '../model/types'

/** Textes de la coque (lot 2A) : titres de page, bloc « Reprendre », annonces de Mes documents. */
interface Shell {
  titleHome: string
  titleEditor: string
  titleLetter: string
  /** Nom du groupe de boutons Modifier / Aperçu. */
  view: string
  resume: string
  /** `{name}` et `{date}`. */
  resumeLine: string
  resumeLocal: string
  resumeBtn: string
  /** `{name}`. */
  duplicated: string
  /** Pluriel par catégorie d'Intl.PluralRules ; `{n}` = nombre. `other` toujours présent. */
  imported: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }
}

const one = (o: string, a: string) => ({ one: o, other: a })

const S: Record<Lang, Shell> = {
  fr: {
    titleHome: 'Créer mon CV', titleEditor: 'Éditeur de CV', titleLetter: 'Lettre de motivation', view: 'Affichage',
    resume: 'Reprendre mon CV', resumeLine: '{name}, modifié le {date}', resumeLocal: 'Il est enregistré dans ce navigateur, sur cet appareil.', resumeBtn: 'Reprendre',
    duplicated: '{name} dupliqué', imported: one('{n} document importé.', '{n} documents importés.'),
  },
  en: {
    titleHome: 'Create my CV', titleEditor: 'CV editor', titleLetter: 'Cover letter', view: 'View',
    resume: 'Continue my CV', resumeLine: '{name}, edited {date}', resumeLocal: 'It is saved in this browser, on this device.', resumeBtn: 'Continue',
    duplicated: '{name} duplicated', imported: one('{n} document imported.', '{n} documents imported.'),
  },
  es: {
    titleHome: 'Crear mi CV', titleEditor: 'Editor de CV', titleLetter: 'Carta de presentación', view: 'Vista',
    resume: 'Retomar mi CV', resumeLine: '{name}, modificado el {date}', resumeLocal: 'Está guardado en este navegador, en este dispositivo.', resumeBtn: 'Retomar',
    duplicated: '{name} duplicado', imported: one('{n} documento importado.', '{n} documentos importados.'),
  },
  de: {
    titleHome: 'Meinen Lebenslauf erstellen', titleEditor: 'Lebenslauf-Editor', titleLetter: 'Anschreiben', view: 'Ansicht',
    resume: 'Meinen Lebenslauf fortsetzen', resumeLine: '{name}, geändert am {date}', resumeLocal: 'Er ist in diesem Browser auf diesem Gerät gespeichert.', resumeBtn: 'Fortsetzen',
    duplicated: '{name} dupliziert', imported: one('{n} Dokument importiert.', '{n} Dokumente importiert.'),
  },
  it: {
    titleHome: 'Crea il mio CV', titleEditor: 'Editor di CV', titleLetter: 'Lettera di presentazione', view: 'Vista',
    resume: 'Riprendi il mio CV', resumeLine: '{name}, modificato il {date}', resumeLocal: 'È salvato in questo browser, su questo dispositivo.', resumeBtn: 'Riprendi',
    duplicated: '{name} duplicato', imported: one('{n} documento importato.', '{n} documenti importati.'),
  },
  pt: {
    titleHome: 'Criar o meu CV', titleEditor: 'Editor de CV', titleLetter: 'Carta de apresentação', view: 'Vista',
    resume: 'Retomar o meu CV', resumeLine: '{name}, alterado em {date}', resumeLocal: 'Está guardado neste navegador, neste dispositivo.', resumeBtn: 'Retomar',
    duplicated: '{name} duplicado', imported: one('{n} documento importado.', '{n} documentos importados.'),
  },
  ar: {
    titleHome: 'إنشاء سيرتي الذاتية', titleEditor: 'محرر السيرة الذاتية', titleLetter: 'رسالة التحفيز', view: 'العرض',
    resume: 'متابعة سيرتي الذاتية', resumeLine: '{name}، آخر تعديل في {date}', resumeLocal: 'هي محفوظة في هذا المتصفح، على هذا الجهاز.', resumeBtn: 'متابعة',
    duplicated: 'تم تكرار {name}',
    imported: { one: 'تم استيراد مستند واحد.', two: 'تم استيراد مستندين.', few: 'تم استيراد {n} مستندات.', many: 'تم استيراد {n} مستندًا.', other: 'تم استيراد {n} مستند.' },
  },
}

export const shell = S

/** Phrase d'import au bon pluriel (règles de la langue de l'interface). */
export const importedText = (lang: Lang, n: number) => {
  const m = S[lang].imported
  return (m[new Intl.PluralRules(lang).select(n)] ?? m.other).replace('{n}', String(n))
}

/** Date et heure : format du navigateur quand sa langue est celle de l'interface (en-GB donne jj/mm/aaaa), sinon celui de l'interface. */
export const formatDate = (ms: number, lang: Lang, withTime = true) => {
  const nav = typeof navigator === 'undefined' ? '' : navigator.language
  const locale = nav.split('-')[0] === lang ? nav : lang
  const tag = lang === 'ar' && !locale.includes('-u-') ? `${locale}-u-nu-latn` : locale
  const opts: Intl.DateTimeFormatOptions = withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' }
  try { return new Intl.DateTimeFormat(tag, opts).format(ms) } catch { return new Intl.DateTimeFormat(lang, opts).format(ms) }
}

export type Route = 'home' | 'edit' | 'letter' | 'docs'
export const readRoute = (hash = location.hash): Route =>
  hash.startsWith('#/edit') ? 'edit' : hash.startsWith('#/lettre') ? 'letter' : hash.startsWith('#/documents') ? 'docs' : 'home'
