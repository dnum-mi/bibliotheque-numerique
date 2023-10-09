import { SmallDemarcheOutputDto } from '../dto'
import { SmallCustomFilterDto } from './small-custom-filter-dto.interface'
import { ITotal } from './total.interface'

export interface ICustomFilterStat {
  customFilter: SmallCustomFilterDto,
  totals: ITotal[]
  demarche: SmallDemarcheOutputDto
}
