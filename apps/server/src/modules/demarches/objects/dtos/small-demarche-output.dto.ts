import {
  ISmallDemarcheOutput,
} from '@biblio-num/shared'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

export class SmallDemarcheOutputDto
  extends PickType(Demarche, [
    'id',
    'title',
    'types',
    'identification',
    'types',
  ])
  implements ISmallDemarcheOutput {
  @ApiProperty({
    description: 'Id de la démarche dans le démarche simplifiée',
  })
  dsId: number

  @ApiProperty({
    description: 'Date de création provenant de démarche simplifiée',
  })
  dsCreatedAt: Date

  @ApiProperty({
    description: 'Date de publication provenant de démarche simplifiée',
  })
  dsPublishedAt: Date
}
