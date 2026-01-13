import { IdentificationDemarcheKey } from "./identification-demarches"

export interface IDataTableSmallDemarche {
  id: number
  types: string[]
  dsId: number
  identification: IdentificationDemarcheKey
  dsCreatedAt: Date
  dsPublishedAt: Date
}
