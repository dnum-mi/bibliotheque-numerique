export type SyncAllDemarchePayload = {
  fromScratch: boolean
}

export type SyncOneDemarchePayload = {
  demarcheId: number
  fromScratch: boolean
}

export type SyncOneDossierPayload = {
  demarcheId: number
  dsDossierId: number
  fromScratch: boolean
}

export type SyncOrCreateOneOrganismePayload = {
  organismeId: number;
  rna?: string;
  rnf?: string;
}

export type UploadFilePayload = {
  dossierDsId: number
  champDsId: string
  isAttestation: boolean
}
