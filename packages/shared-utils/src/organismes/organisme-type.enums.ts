export const OrganismeType = {
  unknown: 'unknown',
  FDD: 'FDD',
  FE: 'FE',
  FRUP: 'FRUP',
  ARUP: 'ARUP',
  CULTE: 'CULTE',
}

export type OrganismeTypeKeys = (typeof OrganismeType)[keyof typeof OrganismeType]
