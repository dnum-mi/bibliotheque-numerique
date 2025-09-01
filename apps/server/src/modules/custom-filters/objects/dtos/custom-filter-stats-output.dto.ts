import { ICustomFilterStat } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'
import { SmallCustomFilterDto } from '@/modules/custom-filters/objects/dtos/small-custom-filter.dto'
import { TotalDto } from '@/modules/custom-filters/objects/dtos/total.dto'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'

export class CustomFilterStatsOutputDto implements ICustomFilterStat {
  @ApiProperty({
    description: 'affichage en question',
    type: SmallCustomFilterDto,
  })
  customFilter: SmallCustomFilterDto

  @ApiProperty({
    description: "Les totaux de l'affichage",
    type: TotalDto,
    isArray: true,
  })
  totals: TotalDto[]

  @ApiProperty({
    description: "La démarche liée à l'affichage.",
    type: SmallDemarcheOutputDto,
  })
  demarche: SmallDemarcheOutputDto
}
