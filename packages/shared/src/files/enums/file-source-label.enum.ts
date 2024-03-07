import { createEnum } from '../../factories'

export const fileDsSourceLabels = [
  'ds-annotation',
  'ds-message',
  'ds-demandeur',
  'ds-attestation',
  'ds-champ',
] as const

export const fileSourceLabels = [
  'rnf',
  'rna',
  ...fileDsSourceLabels,
] as const

export type FileDsSourceLabelKey = (typeof fileDsSourceLabels)[number]
export type FileSourceLabelKey = (typeof fileSourceLabels)[number]

export const eFileSourceLabel = createEnum(fileSourceLabels)

export const eFileDsSourceLabel = createEnum(fileDsSourceLabels)

export const dFileSourceLabelDictionary: Record<FileSourceLabelKey, string> = {
  [eFileSourceLabel.rnf]: 'RNF',
  [eFileSourceLabel.rna]: 'RNA',
  [eFileSourceLabel['ds-annotation']]: 'Annotation DS',
  [eFileSourceLabel['ds-message']]: 'Message DS',
  [eFileSourceLabel['ds-demandeur']]: 'Demandeur DS',
  [eFileSourceLabel['ds-attestation']]: 'Attestation DS',
  [eFileSourceLabel['ds-champ']]: 'Champ DS',
}
