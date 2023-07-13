import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateRoleDto {
  @ApiProperty({
    description: 'Le nom de rôle',
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'La description de rôle',
  })
  description: string

  @ApiProperty({
    description: 'Les permissions de rôle',
  })
  permissions: string[]
}
