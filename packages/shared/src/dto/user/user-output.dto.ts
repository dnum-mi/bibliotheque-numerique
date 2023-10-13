import { ApiProperty, OmitType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { IRole } from '../../interfaces'

export class UserOutputDto extends OmitType(CreateUserDto, ['password']) {
  @ApiProperty({
    description: 'Id unique de l’utilisateur',
  })
  id: number

  @ApiProperty({
    description: 'Role de l\'utilisateur',
  })
  role: IRole
}
