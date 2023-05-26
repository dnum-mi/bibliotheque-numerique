import { CreateUserDto } from './create-user.dto'

import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Rôles de l’utilisateur',
    example: ['Instructeur', 'Admin'],
  })
  @IsString({
    each: true,
    message:
    'Les rôles doivent être des chaînes de caractères (dans un tableau)',
  })
    roles?: string[]
}
