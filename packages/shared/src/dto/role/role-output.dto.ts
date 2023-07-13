import { ApiProperty } from '@nestjs/swagger'
import { CreateRoleDto } from './create-role.dto'

export class RoleOutputDto extends CreateRoleDto {
  @ApiProperty({
    description: 'Id unique de rôle',
  })
  id: string
}
