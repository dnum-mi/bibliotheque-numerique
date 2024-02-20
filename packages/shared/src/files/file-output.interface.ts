import type { IFile } from './file.interface'

export interface IFileOutput extends Omit<IFile, 'checksum'> {
  id: number
  createdAt: Date
  updatedAt: Date
  label: string
  originalLabel: string
  byteSize: number
  mimeType: string
  state: 'queued' | 'uploading' | 'uploaded' | 'failed'
  sourceLabel: 'rnf' | 'rna' | 'ds-champ' | 'ds-annotation' | 'ds-message' | 'ds-demandeur' | 'bnum'
  sourceUploadedAt?: Date
  tags: string[]
  dossierId?: number
  organismeId?: number
  uploaderId?: number
  url: string
}
