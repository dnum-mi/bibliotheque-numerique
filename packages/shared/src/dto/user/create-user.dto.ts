import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { IsPasswordStrongEnough } from './is-password-strong-enough.js'

export class CreateUserDto {
  @ApiProperty({
    description: 'Adresse courriel de l’utilisateur',
  })
  @IsEmail(undefined, { message: 'Cette adresse courriel semble invalide' })
  @IsNotEmpty()
    email: string

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsPasswordStrongEnough({ message: 'Ce mot de passe n’est pas assez fort' })
    password: string
}
