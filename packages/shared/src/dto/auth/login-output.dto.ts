import { ApiProperty } from '@nestjs/swagger'
import { RoleOutputDto } from '../role'

export class LoginOutputDto {
  @ApiProperty({
    description: 'Id unique de l’utilisateur',
  })
  id: number

  @ApiProperty({
    description: 'Adresse courriel de l’utilisateur',
  })
  email: string

  @ApiProperty({
    description: 'Rôles de l’utilisateur',
  })
  roles?: RoleOutputDto[]
}
