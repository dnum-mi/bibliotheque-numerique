import type { PrefectureKey } from '../prefectures'

export interface ILeanDossierOutput {
  id: number
  demarcheId: number
  demarcheTitle: string
  prefecture: PrefectureKey
  state: string
  dateDepot: Date
}
