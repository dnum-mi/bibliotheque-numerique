import { IUserFriendlyFilter } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class UserFriendlyFilterDto implements IUserFriendlyFilter {
  @ApiProperty({
    description: 'Nom du filtre',
    type: String,
  })
  label: string

  @ApiProperty({
    description: 'Valeur en français du filtre',
    type: String,
  })
  value: string
}
