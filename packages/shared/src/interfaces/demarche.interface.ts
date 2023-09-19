import { MappingColumn } from '../dto'
import { Demarche as TDemarche } from '@dnum-mi/ds-api-client'

export interface IDemarche {
  id: number
  state: string | null
  title: string
  identification: string
  mappingColumns: MappingColumn[]
  dsDataJson: Partial<TDemarche>
  type: string
}
