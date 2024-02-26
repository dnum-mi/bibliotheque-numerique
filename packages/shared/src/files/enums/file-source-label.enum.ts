import { createEnum } from '../../factories'

const fileDsSourceLabels = [
  'ds-annotation',
  'ds-message',
  'ds-demandeur',
  'ds-attestation',
  'ds-champ',
] as const

const fileSourceLabels = [
  'rnf',
  'rna',
  ...fileDsSourceLabels,
] as const

export type FileDsSourceLabelKey = (typeof fileDsSourceLabels)[number]
export type FileSourceLabelKey = (typeof fileSourceLabels)[number]

export const eFileSourceLabel = createEnum(fileSourceLabels)

export const eFileDsSourceLabel = createEnum(fileDsSourceLabels)
