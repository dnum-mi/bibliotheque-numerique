export interface IRafEvent {
  id: string
  type: string
  action?: string | null
  isCorrection: boolean
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
  dsTraitementEventAt?: Date | null
  dsTraitementEvent?: string | null
  dossierInstructeurGroup?: string | null
  organismeBefore?: object
}
