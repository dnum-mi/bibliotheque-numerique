import { UserFriendlyFilterDto } from '@/modules/views/objects/dtos/user-friendly-filter.dto'
import { ApiProperty } from '@nestjs/swagger'
import { ISmallView } from '@biblio-num/shared'

export class SmallViewDto implements ISmallView {
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
