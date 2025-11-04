import { FieldTypeKeys } from '@biblio-num/shared'
import { Demarche } from '../entities/demarche.entity'

export const DemarcheFieldTypeHash: Record<
  keyof Pick<
    Demarche,
    | 'id'
    | 'title'
    | 'types'
    | 'identification'
    | 'dsId'
    | 'dsCreatedAt'
    | 'dsPublishedAt'
  >,
  FieldTypeKeys
> = {
  id: 'number',
  title: 'string',
  types: 'strings',
  identification: 'string',
  dsId: 'number',
  dsCreatedAt: 'date',
  dsPublishedAt: 'date',
}
