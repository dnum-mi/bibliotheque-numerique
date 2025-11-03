import { JobPositionKey, qualityInOrganismeKey, OrganismeStatusKey } from './enums'
import { ISiafAddress } from './common-output.interface'
import { IFile } from './file-output.interface'

export type OrganismeKind = 'Foundation' | 'Association'
export type LegalEntityType = OrganismeKind | 'Entreprise' | string
export type LineageKind = 'Fusion' | 'Scission' | 'Transformation'

export interface IOrganismeRef {
  kind: OrganismeKind
  publicId: string
}

export interface ILineage {
  organismes: IOrganismeRef[]
  type: LineageKind
  at: Date
}

export interface ILegalEntity {
  type: LegalEntityType
  publicId: string
}

export interface IPerson {
  _id: string
  lastName: string
  firstName: string

  bornAt: Date | null
  address: ISiafAddress | null
  civility: string | null
  email: string | null
  phone: string | null
  profession: string | null
  nationality: string | null
  bornPlace: string | null
  isFounder: boolean
  residenceCountry: string | null
  entryAt: Date | null
  exitAt: Date | null

  quality: qualityInOrganismeKey | null
  role: JobPositionKey | null
}

export interface ISiafOrganisme {
  id: string
  _createdAt: Date
  _updatedAt: Date

  // publicId: string
  status: OrganismeStatusKey
  statusEffectiveAt: Date | null

  siret: string | null
  creationAt: Date
  title: string
  address: ISiafAddress
  email: string
  phone: string
  department: string
  socialObject: string | null
  website: string | null
  files: IFile[]
  publicGenerosityYears: number[]
  publicSubsidyYears: number[]
  foreignFinancingYears: number[]
  dueDate: Date | null
  hasInternationalActivity: boolean
  fiscalEndAt: Date | null
  accountDepositYears: number[]
  persons: IPerson[]

  founderLegalEntities: ILegalEntity[]
  foundedLegalEntities: ILegalEntity[]
  governanceLegalEntities: ILegalEntity[]

  fromLineage: ILineage | null
  toLineage: ILineage | null
}
