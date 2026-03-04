import { DossierSourceKey } from "./enums/dossier-source.enum"

export interface IOrganismeDossier {
  id: number | null
  source: DossierSourceKey | null
  demarche: string
  statut: string | null
  repere: string | null
  dateDepot: Date | null
  dateDecision: Date | null
  datePublication: Date | null
}
