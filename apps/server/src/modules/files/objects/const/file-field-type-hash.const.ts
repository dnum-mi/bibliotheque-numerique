import { FieldTypeKeys } from '@biblio-num/shared'
import { FileOutputDto } from '@/modules/files/objects/dto/file-output.dto'

// TODO: maybe there is an elegant way to have this.
export const FileFieldTypeHash: Record<
  keyof FileOutputDto,
  FieldTypeKeys
> = {
  id: 'number',
  createdAt: 'date',
  updatedAt: 'date',
  label: 'string',
  originalLabel: 'string',
  mimeType: 'enum',
  state: 'enum',
  sourceLabel: 'enum',
  sourceUploadedAt: 'date',
  tag: 'enum',
  uuid: 'string',
}
