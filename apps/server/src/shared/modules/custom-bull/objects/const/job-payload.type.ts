import { File } from '@/modules/files/objects/entities/file.entity'
import { SyncState } from '@/shared/sync-state/objects/entities/sync-state.entity'
import {
  DemarcheAnonymisedInformationPayloadDto,
} from '@/modules/demarches/objects/dtos/demarch-anonymised-information-payload.dto'

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
  syncState?: SyncState['id'],
}

export type SyncOneRnaOrganismeJobPayload = SyncOneOrganismeJobPayload & {
  rna: string,
  syncState?: SyncState['id'],
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

export type UploadMaarchFileJobPayload = {
  file: File
}

export type ComputeFeExcelJobPayload = {
  file: File
}

export type AnonymiseOneDemarcheJobPayload = {
  demarche: DemarcheAnonymisedInformationPayloadDto
}

export type AnonymiseOneDossierJobPayload = {
  dossierId: number
  demarche: DemarcheAnonymisedInformationPayloadDto
}

export type DeleteS3FilesJobPayload = {
  fileUuids: string[]
}

export type RebuildProjectionTablesPayload = {
  demarcheId: number
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
  | UploadMaarchFileJobPayload
  | RebuildProjectionTablesPayload
