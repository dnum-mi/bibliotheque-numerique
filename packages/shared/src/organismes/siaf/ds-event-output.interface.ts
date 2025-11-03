import { IAssociationOutput } from "./association-output.interface"
import { IFoundationOutput } from "./foundation-output.interface"
export interface IDsEvent<T = IAssociationOutput | IFoundationOutput> {
  publishedJoafAt: Date | null
  demarcheName: string
  demarcheNumber: number
  dossierNumber: number
  acceptedAt: Date
  organismeBefore: T | null
}
