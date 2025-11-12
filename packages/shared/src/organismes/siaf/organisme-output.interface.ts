import { OrganismeStatusKey } from './enums'
import { ISiafAddress } from './common-output.interface'
import { IFile } from './file-output.interface'
import { IPerson } from './person.interface'

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

export interface ISiafOrganisme {
  id: string
  createdAt: Date
  updatedAt: Date

  state: OrganismeStatusKey
  stateEffectiveAt: Date | null

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
