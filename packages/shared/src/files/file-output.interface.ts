import { SourceLabel, State, IFile } from './file.interface'

export interface IFileOutput extends Omit<IFile, 'checksum'> {
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
