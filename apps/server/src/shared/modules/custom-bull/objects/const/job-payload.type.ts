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

export type SyncOneRnfOrganismePayload = {
  dossierId: number;
  rnf: string;
}

export type SyncOneRnaOrganismePayload = {
  dossierId: number;
  rna: string;
}

// TODO: this will be in file entity when file epic is done
type sourceLabel = 'rnf' | 'rna' | 'ds-champ' | 'ds-annotation' | 'ds-message' | 'ds-demandeur' | 'bnum' | 'ds-attestation'

export type UploadFilePayload = {
  dossierDsId: number
  originStringId?: string
  originType: sourceLabel
  index?: number
}
