import { File } from '@/modules/files/objects/entities/file.entity'

export type SyncAllDemarcheJobPayload = {
  fromScratch: boolean
}

export type SyncOneDemarcheJobPayload = {
  demarcheId: number
  fromScratch: boolean
}

export type SyncOneDossierJobPayload = {
  demarcheId: number
  dsDossierId: number
  fromScratch: boolean
}

export type SyncOneOrganismeJobPayload = {
  dossierId?: number
  fieldId?: number
}

export type SyncOneRnfOrganismeJobPayload = SyncOneOrganismeJobPayload & {
  rnf: string
}

export type SyncOneRnaOrganismeJobPayload = SyncOneOrganismeJobPayload & {
  rna: string
}

export type UploadDsFileJobPayload = {
  dsDossierId: number,
  fieldId?: number,
  file: File
}

export type ComputeFeExcelJobPayload = {
  file: File,
}
