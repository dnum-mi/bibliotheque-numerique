import type { ITotal } from '../common'
import type { ISmallDemarcheOutput } from '../demarches'
import type { ISmallCustomFilter } from './small-custom-filter-dto.interface'

export interface ICustomFilterStat {
  customFilter: ISmallCustomFilter
  totals: ITotal[]
  demarche: ISmallDemarcheOutput
}
