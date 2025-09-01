import { PickType } from '@nestjs/swagger'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'

export const smallRnaOrganismeDtoKeys = [
  'id',
  'idRna',
] satisfies (keyof Organisme)[]

export class SmallRnaOrganismeDto extends PickType(
  Organisme,
  smallRnaOrganismeDtoKeys,
) {}
