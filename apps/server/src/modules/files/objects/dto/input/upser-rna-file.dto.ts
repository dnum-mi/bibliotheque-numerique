import { FileTagKey } from '@biblio-num/shared'

export class UpsertRnaFileDto {
  sourceStringId: string
  tag: FileTagKey
  label: string
  organismeId: number
}
