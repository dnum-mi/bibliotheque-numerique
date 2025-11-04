import { IdentificationDemarcheKey } from "./identification-demarches"

export interface IAgGridSmallDemarche {
  id: number
  types: string[]
  dsId: number
  identification: IdentificationDemarcheKey
  dsCreatedAt: Date
  dsPublishedAt: Date
}
