import { IFileOutput, SourceLabel, State } from '@biblio-num/shared'

export class FileOutputDto implements IFileOutput {
  id: number
  createdAt: Date
  updatedAt: Date
  label: string
  originalLabel: string
  byteSize: number
  mimeType: string
  state: State
  sourceLabel: SourceLabel
  sourceUploadedAt?: Date
  tag: string
  dossierId?: number
  organismeId?: number
  uploaderId?: number
  url: string
}
