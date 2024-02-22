import type { IBaseEntity } from '../../common/base-entity.interface'
import type { FileMimeTypeKey, FileSourceLabelKey, FileTagKey } from '../enums'
import type { StateKey } from '../../state'

export interface IFileOutput extends IBaseEntity {
  label: string
  originalLabel: string
  mimeType: FileMimeTypeKey
  state: StateKey
  sourceLabel: FileSourceLabelKey
  sourceUploadedAt: Date | null
  tag: FileTagKey
  uuid: string
}
