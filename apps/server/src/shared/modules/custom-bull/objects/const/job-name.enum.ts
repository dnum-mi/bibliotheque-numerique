import { createEnum } from '@biblio-num/shared'

const jobNames = [
  'SyncAllDemarche',
  'SyncOneDemarche',
  'SyncOneDossier',
  'ComputeTimeTracking',
  'ComputeFeExcel',
  'UploadDsFile',
  'UploadMaarchFile',
  'AnonymiseAll',
  'AnonymiseOneDemarche',
  'AnonymiseOneDossier',
  'DeleteS3Files',
  'FixOrganismeDossier',
] as const

export type JobNameKey = typeof jobNames[number]

export const eJobName = createEnum(jobNames)
