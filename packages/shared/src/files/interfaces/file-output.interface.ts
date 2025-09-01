import type { IBaseEntity } from '../../common/base-entity.interface'
import type { FileExtensionKey, FileSourceLabelKey, FileTagKey } from '../enums'
import type { StateKey } from '../../state'

export interface IFileOutput extends IBaseEntity {
  label: string
  originalLabel: string
  mimeType: FileExtensionKey
  state: StateKey
  sourceLabel: FileSourceLabelKey
  sourceUploadedAt: Date | null
  tag: FileTagKey
  uuid: string
}
