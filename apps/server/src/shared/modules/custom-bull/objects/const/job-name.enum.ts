export const JobName = {
  SyncAllDemarche: 'SyncAllDemarche',
  SyncOneDemarche: 'SyncOneDemarche',
  SyncOneDossier: 'SyncOneDossier',
  SyncAllRnfOrganisme: 'SyncAllRnfOrganisme',
  SyncAllRnaOrganisme: 'SyncAllRnaOrganisme',
  SyncOneRnaOrganisme: 'SyncOneRnaOrganisme',
  SyncOneRnfOrganisme: 'SyncOneRnfOrganisme',
  ComputeTimeTracking: 'ComputeTimeTracking',
  UploadFile: 'UploadFile',
} as const
export type JobNameKeys = (typeof JobName)[keyof typeof JobName]
