import { createEnum } from "factories"

export const OrganismeDossierSource = [
  'ds',
  'rna',
] as const

export type TOrganismeDossierSource = typeof OrganismeDossierSource[keyof typeof OrganismeDossierSource]
export const eOrganismeDossierSource = createEnum(OrganismeDossierSource)

export interface IOrganismeDossier {
  id: number | null
  source: TOrganismeDossierSource | null
  demarche: string
  statut: string | null
  repere: string | null
  dateDepot: Date | null
  dateDecision: Date | null
  datePublication: Date | null
  isClickable: boolean
}
