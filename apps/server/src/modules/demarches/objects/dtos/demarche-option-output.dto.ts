import { IDemarcheOption } from '@biblio-num/shared'
import { PickType } from '@nestjs/swagger'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

export class DemarcheOptionOutputDto
  extends PickType(Demarche, ['nbrMonthAnonymisation', 'anonymizationEvent', 'isOnAllDossiersOfOrganisme'])
  implements IDemarcheOption {
}
