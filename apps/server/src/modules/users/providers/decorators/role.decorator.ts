import { CustomDecorator, SetMetadata } from '@nestjs/common'
import { RolesKeys } from '@biblio-num/shared'

export const ROLE_KEY = 'role'

export const Role = (role: RolesKeys | 'any'): CustomDecorator =>
  SetMetadata(ROLE_KEY, role)
