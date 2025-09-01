import type { Demarche as TDemarche } from '@dnum-mi/ds-api-client'
import type { OrganismeTypeKey } from '../organismes'
import type { IMappingColumn } from './mapping-column.interface'

export interface IDemarche {
  id: number
  state: string | null
  title: string
  identification: string
  mappingColumns: IMappingColumn[]
  dsDataJson: Partial<TDemarche>
  types: OrganismeTypeKey[]
}
