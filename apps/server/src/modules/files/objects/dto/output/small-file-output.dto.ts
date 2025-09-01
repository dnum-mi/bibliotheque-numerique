import { PickType } from '@nestjs/swagger'
import { File } from '@/modules/files/objects/entities/file.entity'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'

export const smallFileOutputKeys: (keyof File)[] = [
  'uuid',
  'originalLabel',
  'label',
  'mimeType',
  'state',
  'organismeId',
  'storageIn',
]

export class SmallFileOutputDto extends PickType(File, smallFileOutputKeys) {}
export const smallOrganisme: (keyof Organisme)[] = [
  'id',
  'idRna',
  'idRnf',
]
class SmallOrganisme extends PickType(Organisme, smallOrganisme) {}

export class SmallFileOutputWithOrganismeDto extends SmallFileOutputDto {
  organisme: SmallOrganisme
}
