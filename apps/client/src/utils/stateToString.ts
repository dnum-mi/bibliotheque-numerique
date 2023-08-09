
// TODO: Récuperer les types de ds-api-client
// eslint-disable-next-line no-unused-vars
enum DossierState {
  // eslint-disable-next-line no-unused-vars
  EnConstruction = 'en_construction',
  // eslint-disable-next-line no-unused-vars
  EnInstruction = 'en_instruction',
  // eslint-disable-next-line no-unused-vars
  Accepte = 'accepte',
  // eslint-disable-next-line no-unused-vars
  Refuse = 'refuse',
  // eslint-disable-next-line no-unused-vars
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
