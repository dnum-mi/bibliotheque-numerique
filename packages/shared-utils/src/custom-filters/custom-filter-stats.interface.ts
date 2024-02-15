import type { ISmallDemarcheOutput } from '../demarches/small-demarche-output.interface'
import type { ITotal } from '../common'
import type { SmallCustomFilterDto } from './small-custom-filter-dto.interface'

export interface ICustomFilterStat {
  customFilter: SmallCustomFilterDto
  totals: ITotal[]
  demarche: ISmallDemarcheOutput
}
