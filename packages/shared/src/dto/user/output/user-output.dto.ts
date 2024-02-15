import { ApiProperty, OmitType } from '@nestjs/swagger'
import { CreateUserDto } from '../input/create-user.dto'
import { IRole } from '@biblio-num/shared-utils'

export class UserOutputDto extends OmitType(CreateUserDto, ['password']) {
  @ApiProperty({
    description: 'Id unique de l’utilisateur',
  })
  id: number

  @ApiProperty({
    description: 'Date de modification de l\'utilisateur',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Date de créatino de l\'utilisateur',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Role de l\'utilisateur',
  })
  role: IRole
}
