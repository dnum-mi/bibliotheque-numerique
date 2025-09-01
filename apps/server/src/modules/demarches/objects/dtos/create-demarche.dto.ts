import { IsNumber } from 'class-validator'
import { ICreateDemarche } from '@biblio-num/shared'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

export class CreateDemarcheDto
  extends PickType(Demarche, ['identification', 'types'])
  implements ICreateDemarche {
  @ApiProperty({
    description: 'Numéro ID de la démarche sur démarche simplifié',
  })
  @IsNumber()
  idDs: number
}
