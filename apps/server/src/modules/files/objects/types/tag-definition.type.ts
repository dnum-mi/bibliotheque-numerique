import { FileTagKey } from '@biblio-num/shared'

export type TagDefinition = {
  title: string | null
  code: string
  tag: FileTagKey
  renameFunction?: (payload: unknown) => string
}
