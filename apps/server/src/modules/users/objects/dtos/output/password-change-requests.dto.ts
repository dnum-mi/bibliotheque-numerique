import { ApiProperty, PickType } from '@nestjs/swagger'
import { CreateUserDto } from '../input/create-user.dto'
import { IPasswordChangeRequestsOutput } from '@biblio-num/shared'

export class PasswordChangeRequestsDto
  extends PickType(CreateUserDto, [
    'firstname',
    'lastname',
    'email',
    'prefecture',
  ])
  implements IPasswordChangeRequestsOutput {
  @ApiProperty({
    description: 'Id unique de l’utilisateur',
  })
  id: number

  @ApiProperty({
    description: 'La date à laquelle la demande a été faite',
  })
  passwordChangeRequestedAt: Date
}
