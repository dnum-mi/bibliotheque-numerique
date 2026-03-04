import { IOrganismeDossier, eDossierSource, DossierSourceKey } from '@biblio-num/shared'
import { DossierState } from '@dnum-mi/ds-api-client'

// TODO: mettre à jour ds-api-client et corriger cette fonction
const eventStatutMapping: Record<string, string> = {
  accepte_automatiquement: DossierState.Accepte,
  classe_sans_suite: DossierState.SansSuite,
  depose: DossierState.EnConstruction,
  depose_correction_instructeur: DossierState.EnConstruction,
  depose_correction_usager: DossierState.EnConstruction,
  repasse_en_construction: DossierState.EnConstruction,
  passe_en_instruction: DossierState.EnInstruction,
  passe_en_instruction_automatiquement: DossierState.EnInstruction,
  repasse_en_instruction: DossierState.EnInstruction,
  refuse_automatiquement: DossierState.Refuse,
}

export const normalizeStatut = (statut: string | null | undefined): string | null => {
  if (!statut) {
    return null
  }
  return eventStatutMapping[statut] ?? statut
}

const eventSourceMapping: Record<string, DossierSourceKey> = {
  ds: eDossierSource.ds,
  rna: eDossierSource.rna,
}

export const normalizeSource = (source: string | null | undefined): DossierSourceKey | null => {
  if (!source) {
    return null
  }
  return eventSourceMapping[source.toLowerCase()] ?? null
}

export const areOrganismeDossiersEquivalent = (a: IOrganismeDossier, b: IOrganismeDossier): boolean => {
  const datesEqual = (d1: Date | null, d2: Date | null): boolean => {
    if (!d1 && !d2) return true
    if (!d1 || !d2) return false
    return d1.getTime() === d2.getTime()
  }
  return (
    a.demarche === b.demarche &&
      a.statut === b.statut &&
      datesEqual(a.dateDepot, b.dateDepot)
  )
}

export const sortByDateDepotDesc = (dossiers: IOrganismeDossier[]): IOrganismeDossier[] => {
  const toTime = (d: Date | null): number => (d ? new Date(d).getTime() : 0)
  return [...dossiers].sort((a, b) => toTime(b.dateDepot) - toTime(a.dateDepot))
}
