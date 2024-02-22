import { FileDsSourceLabelKey, FileTagKey } from '@biblio-num/shared'

export class UpsertDsFileDto {
  sourceStringId?: string
  sourceIndex?: number
  tag?: FileTagKey
  sourceLabel: FileDsSourceLabelKey
  dossierId: number
}
