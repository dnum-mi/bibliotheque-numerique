import type { ILeanDossierOutput, PrefectureKeys } from '@biblio-num/shared-utils'

export class LeanDossierOutputDto implements ILeanDossierOutput {
  id: number
  demarcheId: number
  demarcheTitle: string
  prefecture: PrefectureKeys
  state: string
  depotDate: string
}
