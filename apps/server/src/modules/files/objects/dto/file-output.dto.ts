import { File } from '@/modules/files/objects/entities/file.entity'
import { PickType } from '@nestjs/mapped-types'
import { IFileOutput } from '@biblio-num/shared'

export const fileOutputDtoKeys = [
  'id',
  'createdAt',
  'updatedAt',
  'label',
  'originalLabel',
  'mimeType',
  'state',
  'sourceLabel',
  'sourceUploadedAt',
  'tag',
  'uuid',
] satisfies (keyof File)[]

export class FileOutputDto extends PickType(File, fileOutputDtoKeys) implements IFileOutput {}
