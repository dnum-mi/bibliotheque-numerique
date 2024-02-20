import type { FileSourceLabelKey } from '../enums'
import type { StateKey } from '../../state'
import type { IBaseEntity } from '../../common/base-entity.interface'
import type { FileTagKey } from '../enums/file-tag.enum'

export interface IFile extends IBaseEntity {
  label: string
  originalLabel: string
  checksum: string
  byteSize: number
  mimeType: string
  state: StateKey
  sourceLabel: FileSourceLabelKey
  tags: FileTagKey[]
  sourceIndex?: number
  sourceUploadedAt?: Date
  dossierId?: number
  organismeId?: number
  uploaderId?: number
}
