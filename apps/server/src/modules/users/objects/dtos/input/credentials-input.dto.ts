import { ApiProperty, PickType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { IsNotEmpty } from 'class-validator'
import { ICredentialsInput } from '@biblio-num/shared-utils'

// May change in the future, but for now, it is just like the CreateUserDto class
export class CredentialsInputDto extends PickType(CreateUserDto, ['email']) implements ICredentialsInput {
  @ApiProperty({
    description: 'Mot de passe de l’utilisateur',
  })
  @IsNotEmpty({ message: 'Veuillez remplir le mot de passe' })
  password: string
}
