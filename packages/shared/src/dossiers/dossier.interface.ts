import type { DossierState, Dossier as TDossier } from '@dnum-mi/ds-api-client'
import type { IDemarche } from '../demarches'
import type { PrefectureKey } from '../prefectures'

export interface IDossier {
  id: number
  demarcheId: number
  demarche?: IDemarche
  state: DossierState
  prefecture: PrefectureKey | null
  sourceId: string
  dsDataJson: Partial<TDossier>
  anonymisedAt: Date | null
}
