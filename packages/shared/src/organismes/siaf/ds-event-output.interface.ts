import { IAssociationOutput } from "./association-output.interface"
import { IFoundationOutput } from "./foundation-output.interface"

export interface IDsEventItem<T = IAssociationOutput | IFoundationOutput> {
  id: string
  type: string
  createdAt: Date
  publishedJOAFAt: Date | null
  demarcheName: string
  demarcheNumber: number
  dossierNumber: number
  dossierLocalNumber?: number | null
  demarcheLocalId?: number | null;
  demarcheLocalName?: string | null;
  isDissolution: boolean
  acceptedAt: Date
  dossierInstructeurGroup: string | null
  organismeBefore: T | null
}

export interface IDsEvent<T = IAssociationOutput | IFoundationOutput> {
  id: string,
  last_event_date: Date,
  events: IDsEventItem<T>[]
}
