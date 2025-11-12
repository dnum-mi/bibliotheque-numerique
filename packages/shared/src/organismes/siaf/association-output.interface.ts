import { AssoQualityKey } from './enums'
import { ISiafAddress } from './common-output.interface'
import { IDsEvent } from './ds-event-output.interface'
import { ISiafOrganisme } from './organisme-output.interface'
import { IRnaEvent } from './rna-event-output.interface'

export type UnionKindType = 'Union' | 'Federation'
export type EstablishmentAcquiredType = 'gratuit' | 'onéreux'

export interface IUnion {
  associationPublicIds: string[]
  unionKind: UnionKindType
  since: Date
}

export interface IQuality {
  type: AssoQualityKey
  startedAt: Date
  endedAt: Date | null
}

export interface IEstablishment {
  name: string
  address: ISiafAddress
  type: string | null
  value: number | null
  acquiredType: EstablishmentAcquiredType
}

export interface IAssociationOutput extends ISiafOrganisme {
  activityDomainCode: string | null
  activityDomainDescription: string
  union: IUnion | null
  quality: IQuality | null

  secondaryEstablishments: IEstablishment[]
  acquiredEstablishments: IEstablishment[]
  cededEstablishments: IEstablishment[]

  rnaEvents: IRnaEvent[]
  events: IDsEvent<IAssociationOutput>[]
}
