import { ApiProperty, PickType } from '@nestjs/swagger'
import { UpdateUserDto } from './update-user.dto'

export class UserOutputDto extends UpdateUserDto {
  @ApiProperty({
    description: 'Id unique de l’utilisateur',
  })
    id: string
}
