import { RoleMapper } from '@/modules/ds/objects/types/roleMapper.type'
import { FoundationRole } from '@prisma/client'

export const roleMapper: RoleMapper = {
  'Membre du conseil d\'administration': FoundationRole.MEMBER_BOARD_DIRECTOR,
  'Membre du conseil de surveillance': FoundationRole.MEMBER_SUPERVIROY_BOARD,
  'Membre du directoire': FoundationRole.MEMBER_MANAGEMENT_BOARD,
  'Personne exerçant des fonctions de direction': FoundationRole.PERSON_IN_DIRECTOR_POSITION,
  'Membre du comité consultatif': FoundationRole.MEMBER_ADVISORY_COMMITTEE, // TODO: A supprimer
  'Salarié du fonds de dotation': FoundationRole.FUND_EMPLOYEE, // TODO: A suprimer
  Autre: FoundationRole.NOT_SPECIFIED,
}
