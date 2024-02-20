const fileSourceLabels = [
  'rnf',
  'rna',
  'ds-champ',
  'ds-annotation',
  'ds-message',
  'ds-demandeur',
  'ds-attestation',
]

export type FileSourceLabelKey = (typeof fileSourceLabels)[number]

export const eFileSourceLabel = Object.fromEntries(
  fileSourceLabels.map(fsl => [fsl, fsl]),
) as Record<FileSourceLabelKey, FileSourceLabelKey>
