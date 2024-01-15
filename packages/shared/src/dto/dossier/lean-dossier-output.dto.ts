import { PrefectureKeys } from '../../enums'

export class LeanDossierOutputDto {
  id: number
  demarcheId: number
  demarcheTitle: string
  prefecture: PrefectureKeys
  state: string
  depotDate: string
}
