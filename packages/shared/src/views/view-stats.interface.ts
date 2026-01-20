import type { ITotal } from '../common'
import type { ISmallDemarcheOutput } from '../demarches'
import { ISmallView } from './small-view-dto.interface'

export interface IViewStat {
  view: ISmallView
  totals: ITotal[]
  demarche: ISmallDemarcheOutput
}
