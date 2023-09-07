import { IDemarche } from '../../interfaces'

export class SmallDemarcheOutputDto implements Partial<IDemarche> {
  id: number
  title: string
  dsId: number
}
