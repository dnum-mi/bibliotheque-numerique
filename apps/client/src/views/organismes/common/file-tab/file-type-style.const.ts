// file-type-style.const.ts
import type { TypeFileKey } from '@biblio-num/shared'
import {
  FileText,
  Landmark,
  Scale,
  Mail,
  BadgeAlert,
  Gavel,
  TriangleAlert,
  ClipboardList,
  NotebookText,
  BookOpenText,
  PauseCircle,
  File,
} from 'lucide-vue-next'

export type FileTone = 'info' | 'warning' | 'danger' | 'neutral' | 'success'

export type FileTypeStyle = {
  icon: any
  tone: FileTone
  /** plus petit = plus important */
  order: number
}

/**
 * Source de vérité unique :
 * - icon (lucide)
 * - tone (=> couleurs CSS)
 * - order (importance métier)
 */
export const FILE_TYPE_STYLE: Record<TypeFileKey, FileTypeStyle> = {
  // ⭐️ Les plus importants en haut
  Statuts: { icon: Scale, tone: 'info', order: 1 },
  Comptes: { icon: NotebookText, tone: 'success', order: 2 },

  'Acte d\'autorisation': { icon: Landmark, tone: 'info', order: 3 },
  'Acte notarié': { icon: Landmark, tone: 'info', order: 4 },

  'Procès verbal': { icon: ClipboardList, tone: 'info', order: 5 },
  'Rapport d\'activité': { icon: BookOpenText, tone: 'neutral', order: 6 },
  'Règlement intérieur': { icon: FileText, tone: 'neutral', order: 7 },
  'Courrier adressé par l\'administration': { icon: Mail, tone: 'neutral', order: 8 },

  // ⚠️ “alertes”
  'Mise en demeure': { icon: TriangleAlert, tone: 'warning', order: 9 },
  Suspension: { icon: PauseCircle, tone: 'warning', order: 10 },

  // 🔴 contentieux / sanctions
  Jugement: { icon: Gavel, tone: 'danger', order: 11 },
  'Décision de retrait': { icon: BadgeAlert, tone: 'danger', order: 12 },

  // fallback
  Autre: { icon: File, tone: 'neutral', order: 99 },
} as const

export const DEFAULT_FILE_TYPE: TypeFileKey = 'Autre'

export function getFileTypeStyle (typeFile?: TypeFileKey | null): FileTypeStyle {
  return FILE_TYPE_STYLE[typeFile ?? DEFAULT_FILE_TYPE] ?? FILE_TYPE_STYLE[DEFAULT_FILE_TYPE]
}

/**
 * Trie une liste de types selon importance métier (order),
 * puis alphabétique en fallback.
 */
export function sortTypesByImportance (types: TypeFileKey[]): TypeFileKey[] {
  return [...types].sort((a, b) => {
    const oa = getFileTypeStyle(a).order
    const ob = getFileTypeStyle(b).order
    if (oa !== ob) { return oa - ob }
    return a.localeCompare(b, 'fr')
  })
}
