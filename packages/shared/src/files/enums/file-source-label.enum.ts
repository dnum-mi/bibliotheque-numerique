import { createEnum } from '../../factories'

const fileDsSourceLabels = [
  'ds-annotation',
  'ds-message',
  'ds-demandeur',
  'ds-attestation',
] as const

const fileSourceLabels = [
  'rnf',
  'rna',
  'ds-champ',
  ...fileDsSourceLabels,
] as const

export type FileDsSourceLabelKey = (typeof fileDsSourceLabels)[number]
export type FileSourceLabelKey = (typeof fileSourceLabels)[number]

export const eFileSourceLabel = createEnum(fileSourceLabels)

export const eFileDsSourceLabel = createEnum(fileDsSourceLabels)
