import type { IPersonExtended, IPersonWithAuthorizeOption } from './MembersTableView.vue'

export const isSelfRepresented = (row: IPersonExtended): boolean => {
  return !row.legalEntity || Object.keys(row.legalEntity).length === 0
}

export const hasLegalEntity = (people: IPersonWithAuthorizeOption[]) =>
  people.some(p => p.legalEntity && Object.keys(p.legalEntity).length > 0)

export const getRepresentativeLabel = (row: IPersonExtended): string => {
  const isSelf = isSelfRepresented(row)
  return isSelf ? 'Personne physique' : 'Représentant de la personne morale'
}
