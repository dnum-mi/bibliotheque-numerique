import { DossierState, Dossier as TDossier } from '@dnum-mi/ds-api-client'
import type { PrefectureKeys } from '@biblio-num/shared-utils'
import { IDemarche } from './demarche.interface'
export { Champ, PieceJustificativeChamp, RepetitionChamp, PersonnePhysique, Demandeur, Dossier as TDossier } from '@dnum-mi/ds-api-client'

export interface IDossier {
  id: number
  demarcheId: number
  demarche?: IDemarche
  state: DossierState
  prefecture: PrefectureKeys | null
  sourceId: string
  dsDataJson: Partial<TDossier>
}
