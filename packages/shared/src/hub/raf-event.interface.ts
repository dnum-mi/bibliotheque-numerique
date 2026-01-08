export interface IRafEvent {
  id: string
  type: string
  createdAt: Date
  joPublishedAt: Date | null
  demarcheName: string
  demarcheNumber?: number
  dossierNumber?: number
  dossierLocalNumber?: number | null
  demarcheLocalId?: number | null;
  demarcheLocalName?: string | null;
  isDissolution?: boolean
  acceptedAt?: Date
  dossierInstructeurGroup?: string | null
  organismeBefore?: object
}
