import { IOrganismeDossier, eOrganismeDossierSource, TOrganismeDossierSource } from '@biblio-num/shared'
import { DossierState } from '@dnum-mi/ds-api-client'

const eventStatutMapping: Record<string, string> = {
  passe_en_instruction: DossierState.EnInstruction,
}

export const normalizeStatut = (statut: string | null | undefined): string | null => {
  if (!statut) {
    return null
  }
  return eventStatutMapping[statut] ?? statut
}

const eventSourceMapping: Record<string, TOrganismeDossierSource> = {
  ds: eOrganismeDossierSource.ds,
  rna: eOrganismeDossierSource.rna,
}

export const normalizeSource = (source: string | null | undefined): TOrganismeDossierSource | null => {
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
