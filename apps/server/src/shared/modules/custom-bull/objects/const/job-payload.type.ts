import { File } from '@/modules/files/objects/entities/file.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'

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
  firstTime?: boolean
}

export type SyncOneRnaOrganismeJobPayload = SyncOneOrganismeJobPayload & {
  rna: string
}

export type UploadDsFileJobPayload = {
  dsDossierId: number
  fieldId?: number
  parentSourceId?: string
  file: File
}

export type UploadRnaFileJobPayload = {
  file: File
  rnaUrl: string
}

export type ComputeFeExcelJobPayload = {
  file: File
}

export type AnonymiseOneDemarcheJobPayload = {
  demarche: Demarche
  demarches: Demarche[]
}

export type AnonymiseOneDossierJobPayload = {
  dossier: Dossier
  demarche: Demarche
}

export type DeleteS3FilesJobPayload = {
  files: File[]
}

export type AnyJobPayload =
  | SyncAllDemarcheJobPayload
  | SyncOneDemarcheJobPayload
  | SyncOneDossierJobPayload
  | SyncOneOrganismeJobPayload
  | SyncOneRnfOrganismeJobPayload
  | SyncOneRnaOrganismeJobPayload
  | UploadDsFileJobPayload
  | UploadRnaFileJobPayload
  | ComputeFeExcelJobPayload
