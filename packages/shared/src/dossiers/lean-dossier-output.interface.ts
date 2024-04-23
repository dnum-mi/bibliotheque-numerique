import type { PrefectureKeys } from '../prefectures'

export interface ILeanDossierOutput {
  id: number
  demarcheId: number
  demarcheTitle: string
  prefecture: PrefectureKeys
  state: string
  dateDepot: string
}
