export interface IOrganismeDossier {
  id: number | null
  source: string | null
  demarche: string
  statut: string | null
  repere: string | null
  dateDepot: Date | null
  dateDecision: Date | null
  datePublication: Date | null
  isClickable: boolean
}
