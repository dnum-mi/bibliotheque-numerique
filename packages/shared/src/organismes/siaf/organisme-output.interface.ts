import { OrganismeStatusKey } from './enums'
import { ISiafAddress } from './common-output.interface'
import { IFile } from './file-output.interface'
import { IPerson } from './person.interface'
import { IRafEvent } from '../../hub/raf-event.interface'
import { OrganismeKind } from './enums/organimse-kind.enum'

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
  isPersonDataPrivate: boolean
  persons: IPerson[]

  fromLineage: ILineage | null
  toLineage: ILineage | null

  events: IRafEvent[];
  hub_timestamp?: Date,
}
