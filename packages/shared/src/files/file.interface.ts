export const eStates = {
  queued: 'queued',
  uploading: 'uploading',
  failed: 'failed',
  uploaded: 'uploaded',
} as const

export type State = keyof typeof eStates

export const eSourceLabels = {
  rnf: 'rnf',
  rna: 'rna',
  'ds-champ': 'ds-champ',
  'ds-annotation': 'ds-annotation',
  'ds-message': 'ds-message',
  'ds-demandeur': 'ds-demandeur',
  bnum: 'bnum',
} as const

export type SourceLabel = keyof typeof eSourceLabels

export interface IFile {
  id: number
  createdAt: Date
  updatedAt: Date
  label: string
  originalLabel: string
  checksum: string
  byteSize: number
  mimeType: string
  state: State
  sourceLabel: SourceLabel
  sourceUploadedAt?: Date
  tag: string
  dossierId?: number
  organismeId?: number
  uploaderId?: number
}
