import { createEnum } from '@biblio-num/shared'

const jobNames = [
  'SyncAllDemarche',
  'SyncOneDemarche',
  'SyncOneDossier',
  'SyncAllRnaOrganisme',
  'SyncAllRnfOrganisme',
  'SyncOneRnaOrganisme',
  'SyncOneRnfOrganisme',
  'ComputeTimeTracking',
  'ComputeFeExcel',
  'UploadDsFile',
  'UploadRnaFile',
  'UploadRnfFile',
] as const

export type JobNameKey = typeof jobNames[number]

export const eJobName = createEnum(jobNames)
