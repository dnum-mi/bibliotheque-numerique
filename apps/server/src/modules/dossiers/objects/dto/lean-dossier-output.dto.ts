import type { PrefectureKeys } from '@biblio-num/shared-utils'

export class LeanDossierOutputDto {
  id: number
  demarcheId: number
  demarcheTitle: string
  prefecture: PrefectureKeys
  state: string
  depotDate: string
}
