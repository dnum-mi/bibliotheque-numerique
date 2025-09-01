import { FileDsSourceLabelKey, FileTagKey } from '@biblio-num/shared'

export class UpsertDsFileDto {
  sourceStringId?: string
  sourceIndex?: number
  tag?: FileTagKey
  label?: string
  originalLabel: string
  sourceLabel: FileDsSourceLabelKey
  organismeId?: number
  dossierId: number
}
