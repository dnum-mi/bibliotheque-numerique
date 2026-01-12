import { OmitType } from '@nestjs/swagger'
import { Field } from '../../entities/field.entity'

export class CreateFieldDto extends OmitType(Field, [
  'id',
  'dossier',
  'createdAt',
  'updatedAt',
  'children',
  'parentId',
  'numberValue',
] as const) {
  children?: CreateFieldDto[] | null

  // Redéfinition explicite en number
  numberValue?: number | null
}
