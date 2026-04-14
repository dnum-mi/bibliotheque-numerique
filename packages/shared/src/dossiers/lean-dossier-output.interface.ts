import type { PrefectureKey } from '../prefectures'

export interface ILeanDossierOutput {
  id: number
  demarcheId: number
  demarcheNumber: number
  demarcheTitle: string
  prefecture: PrefectureKey
  state: string
  dateDepot: Date
}
