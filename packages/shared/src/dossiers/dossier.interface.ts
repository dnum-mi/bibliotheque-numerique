import type { DossierState, Dossier as TDossier } from '@dnum-mi/ds-api-client'
import type { IDemarche } from '../demarches'
import type { PrefectureKeys } from '../prefectures'

export interface IDossier {
  id: number
  demarcheId: number
  demarche?: IDemarche
  state: DossierState
  prefecture: PrefectureKeys | null
  sourceId: string
  dsDataJson: Partial<TDossier>
  anonymisedAt: Date | null
}
