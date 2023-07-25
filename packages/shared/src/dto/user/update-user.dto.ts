import { CreateUserDto } from './create-user.dto'

import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

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

export class UpdateUserPasswordDto {
  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: '5CR37P455',
  })
  @IsNotEmpty({
    message:
    'Veuillez indiquer le nouveau mot de passe',
  })
  password: string

  @ApiProperty({
    description: 'Token pour changement de mot de passe',
    example: 'jeytsrniatseirnateisalp7890tsrntesrn.890890D.90V98TESRI0V89IEJ',
  })
  @IsNotEmpty({
    message:
    'Veuillez fournir le token pour changement de mot de passe',
  })
  token: string
}
