import type { Lang } from '../model/types'

/** Textes de l'INTERFACE pour annuler une suppression. `{x}` = nom de ce qui vient d'être supprimé. */
export interface UndoText {
  /** Bandeau, lu dans une région live. */
  deleted: string
  undo: string
  /** Nom de la photo de profil, pour « {x} supprimé(e) ». */
  photo: string
}

export const undoText: Record<Lang, UndoText> = {
  fr: { deleted: '{x} supprimé(e)', undo: 'Annuler', photo: 'Photo' },
  en: { deleted: '{x} deleted', undo: 'Undo', photo: 'Photo' },
  de: { deleted: '{x} gelöscht', undo: 'Rückgängig', photo: 'Foto' },
  es: { deleted: '{x} eliminado/a', undo: 'Deshacer', photo: 'Foto' },
  it: { deleted: '{x} eliminato/a', undo: 'Annulla', photo: 'Foto' },
  pt: { deleted: '{x} removido(a)', undo: 'Desfazer', photo: 'Foto' },
  ar: { deleted: 'تم حذف {x}', undo: 'تراجع', photo: 'صورة' },
}
