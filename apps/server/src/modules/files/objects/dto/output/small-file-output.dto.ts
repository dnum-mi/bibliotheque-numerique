import { PickType } from '@nestjs/swagger'
import { File } from '@/modules/files/objects/entities/file.entity'

export const smallFileOutputKeys: (keyof File)[] = [
  'uuid',
  'originalLabel',
  'label',
  'mimeType',
  'state',
]

export class SmallFileOutputDto extends PickType(File, smallFileOutputKeys) {}
