import { IsNotEmpty } from 'class-validator'
import { Demarche as DemarcheDS } from '@dnum-mi/ds-api-client/dist/@types/types'
import { ApiProperty, PartialType } from '@nestjs/swagger'

import { CreateDemarcheDto } from './create-demarche.dto'

export class UpdateDemarcheDto extends PartialType(CreateDemarcheDto) {
  @ApiProperty({
    description: 'Données de la démarche simplifiée associée',
  })
  @IsNotEmpty()
    dataJson: Partial<DemarcheDS>
}
