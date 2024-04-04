import { RoleMapper } from '@/modules/ds/objects/types/roleMapper.type'
import { FoundationRole } from '@prisma/client'

export const roleMapper: RoleMapper = {
  'Membre du conseil d\'administration': FoundationRole.MEMBER_BOARD_DIRECTOR,
  'Membre du comité consultatif': FoundationRole.MEMBER_ADVISORY_COMMITTEE,
  'Salarié du fonds de dotation': FoundationRole.FUND_EMPLOYEE,
  Autre: FoundationRole.NOT_SPECIFIED,
}
