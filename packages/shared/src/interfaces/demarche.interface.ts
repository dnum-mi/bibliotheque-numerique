import { Demarche as TDemarche } from '@dnum-mi/ds-api-client'

import { OrganismeTypeKeys } from '@biblio-num/shared-utils'
import { MappingColumn } from '../dto'

export interface IDemarche {
  id: number
  state: string | null
  title: string
  identification: string
  mappingColumns: MappingColumn[]
  dsDataJson: Partial<TDemarche>
  types: OrganismeTypeKeys[]
}
