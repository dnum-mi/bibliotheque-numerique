import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { RoleOutputDto } from 'dto/role'

export class UserOutputDto extends OmitType(CreateUserDto, ['password']) {
  @ApiProperty({
    description: 'Id unique de l’utilisateur',
  })
  id: number

  @ApiProperty({
    description: 'Roles de l’utilisateur',
  })
  roles: RoleOutputDto[]
}
