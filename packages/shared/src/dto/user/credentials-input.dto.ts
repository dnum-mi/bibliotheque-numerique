import { ApiProperty } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { IsNotEmpty } from 'class-validator'

// May change in the future, but for now, it is just like the CreateUserDto class
export class CredentialsInputDto extends CreateUserDto {
  @ApiProperty({
    description: 'Mot de passe de l’utilisateur',
  })
  @IsNotEmpty({ message: 'Veuillez remplir le mot de passe' })
  password: string
}
