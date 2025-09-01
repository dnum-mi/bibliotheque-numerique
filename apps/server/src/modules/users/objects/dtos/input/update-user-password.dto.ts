import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { IsPasswordStrongEnough } from './is-password-strong-enough'
import { IUpdateUserPassword } from '@biblio-num/shared'

export class UpdateUserPasswordDto implements IUpdateUserPassword {
  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: '5CR37P455',
  })
  @IsNotEmpty({
    message:
    'Veuillez indiquer le nouveau mot de passe',
  })
  @IsPasswordStrongEnough({
    message: 'Ce mot de passe n’est pas assez fort. ' +
      'Veuillez avoir au moins: \n - 15 caractères\n - une majuscule\n ' +
      '- une minuscule\n - un chiffre\n - un caractère spécial',
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
