import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nom du rôle',
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Description du rôle',
  })
  description: string

  @ApiProperty({
    description: 'Permissions du rôle',
  })
  permissions: string[]
}
