/* eslint-disable no-use-before-define */
import { OmitType } from '@nestjs/swagger'
import { Field } from '../../entities/field.entity'

export class CreateFieldDto extends OmitType(Field, [
  'id',
  'dossier',
  'createdAt',
  'updatedAt',
  'children',
  'parentId',
] as const) {
  children?: CreateFieldDto[] | null
}
