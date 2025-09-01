import { Demarche } from '../entities/demarche.entity'
import { IDemarche } from '@biblio-num/shared'
import { PickType } from '@nestjs/swagger'

export const demarcheOutputDtoKeys: (keyof Demarche)[] = [
  'id',
  'state',
  'title',
  'identification',
  'mappingColumns',
  'dsDataJson',
  'types',
]

export class DemarcheOutputDto
  extends PickType(Demarche, demarcheOutputDtoKeys)
  implements IDemarche {}
