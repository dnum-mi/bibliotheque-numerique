import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { IsPasswordStrongEnough } from './is-password-strong-enough'
import { ICreateUser } from '@biblio-num/shared-utils'

export class CreateUserDto implements ICreateUser {
  @ApiProperty({
    description: 'Prénom de l’utilisateur',
  })
  @IsNotEmpty()
  firstname: string

  @ApiProperty({
    description: 'Nom de l’utilisateur',
  })
  @IsNotEmpty()
  lastname: string

  @ApiProperty({
    description: 'Métier de l’utilisateur',
    nullable: false,
  })
  @IsNotEmpty()
  job: string

  @ApiProperty({
    description: 'Adresse courriel de l’utilisateur',
  })
  @IsEmail(undefined, { message: 'Cette adresse courriel semble invalide' })
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Mot de passe de l’utilisateur',
  })
  @IsNotEmpty({ message: 'Veuillez remplir le mot de passe' })
  @IsPasswordStrongEnough({ message: 'Ce mot de passe n’est pas assez fort' })
  password: string
}
