import { ISmallCustomFilter } from '@biblio-num/shared'
import { UserFriendlyFilterDto } from '@/modules/custom-filters/objects/dtos/user-friendly-filter.dto'
import { ApiProperty } from '@nestjs/swagger'

export class SmallCustomFilterDto implements ISmallCustomFilter {
  @ApiProperty({
    description: "Id de l'affichage",
    type: Number,
  })
  id: number

  @ApiProperty({
    description: "Nom de l'affichage",
    type: String,
  })
  name: string

  @ApiProperty({
    description: "Liste des filtres de l'affichage.",
    type: UserFriendlyFilterDto,
    isArray: true,
  })
  filters: UserFriendlyFilterDto[]
}
