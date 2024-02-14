export const JobName = {
  SyncAllDemarche: 'SyncAllDemarche',
  SyncOneDemarche: 'SyncOneDemarche',
  SyncOneDossier: 'SyncOneDossier',
  SyncAllRnaOrganisme: 'SyncAllRnaOrganisme',
  SyncAllRnfOrganisme: 'SyncAllRnfOrganisme',
  SyncOneRnaOrganisme: 'SyncOneRnaOrganisme',
  SyncOneRnfOrganisme: 'SyncOneRnfOrganisme',
  ComputeTimeTracking: 'ComputeTimeTracking',
  UploadFile: 'UploadFile',
} as const

export type JobNameKeys = (typeof JobName)[keyof typeof JobName]
