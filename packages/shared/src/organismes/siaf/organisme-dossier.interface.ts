export interface IOrganismeDossier {
  id: number | null
  source: string | null
  demarche: string
  statut: string | null
  repere: string | null
  dateDepot: string | null
  dateDecision: string | null
  datePublication: string | null
  isClickable: boolean
}
