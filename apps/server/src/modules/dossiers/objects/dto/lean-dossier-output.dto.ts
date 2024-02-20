import type { ILeanDossierOutput, PrefectureKeys } from '@biblio-num/shared'

export class LeanDossierOutputDto implements ILeanDossierOutput {
  id: number
  demarcheId: number
  demarcheTitle: string
  prefecture: PrefectureKeys
  state: string
  depotDate: string
}
