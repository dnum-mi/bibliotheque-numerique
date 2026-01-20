import { IView } from './view.interface'

export interface ICreateView
  extends Omit<IView, 'id' | 'demarcheId'> {
  id?: number
  demarcheId?: number | undefined
  name: string
  groupByDossier: boolean
  totals: string[] | null
}
