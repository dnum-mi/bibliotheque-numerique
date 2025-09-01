import { PickType } from '@nestjs/swagger'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'

export const smallRnfOrganismeDtoKeys = [
  'id',
  'idRnf',
] satisfies (keyof Organisme)[]

export class SmallRnfOrganismeDto extends PickType(
  Organisme,
  smallRnfOrganismeDtoKeys,
) {}
