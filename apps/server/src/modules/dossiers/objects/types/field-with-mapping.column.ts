import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'

export type FieldWithMappingColumn = Field & {
  mappingColumn: MappingColumn
}
