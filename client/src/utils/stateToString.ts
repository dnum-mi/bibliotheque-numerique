
// TODO: Récuperer les types de ds-api-client
enum DossierState {
  EnConstruction = 'en_construction',
  EnInstruction = 'en_instruction',
  Accepte = 'accepte',
  Refuse = 'refuse',
  SansSuite = 'sans_suite',
}

export const stateToFr = (value:string):string => {
  return {
    [DossierState.Accepte]: 'Accepté-e',
    [DossierState.EnConstruction]: 'En construction',
    [DossierState.EnInstruction]: 'En instruction',
    [DossierState.Refuse]: 'Refusé',
    [DossierState.SansSuite]: 'Sans suite',
  }[value] || ''
}
