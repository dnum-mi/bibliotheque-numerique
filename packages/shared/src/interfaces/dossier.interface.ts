import { Demarche, DossierState, Dossier as TDossier } from '@dnum-mi/ds-api-client'
export { Champ, PieceJustificativeChamp, RepetitionChamp, PersonnePhysique, Demandeur, Dossier as TDossier } from '@dnum-mi/ds-api-client'
export interface IDossier {
  id: number
  demarcheId: number
  demarche?: Demarche
  state: DossierState
  sourceId: string
  dsDataJson: Partial<TDossier>
}
