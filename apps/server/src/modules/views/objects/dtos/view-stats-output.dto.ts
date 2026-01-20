import { IViewStat } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'
import { SmallViewDto } from '@/modules/views/objects/dtos/small-view.dto'
import { TotalDto } from '@/modules/views/objects/dtos/total.dto'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'

export class ViewStatsOutputDto implements IViewStat {
  @ApiProperty({
    description: 'affichage en question',
    type: SmallViewDto,
  })
  view: SmallViewDto

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
