import { MappingColumn } from '../../../demarches/objects/entities/mapping-column.object'
import { FieldType } from '../enums/field-type.enum'
import { FormatFunctionRef } from '@biblio-num/shared'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client'
import { FieldSource } from '../enums/field-source.enum'

type FixFieldValueGetter = (dossier: Partial<TDossier>) => string | number | boolean | Date | null;

export const fixFields: MappingColumn[] = [
  {
    id: '1a4b62c4-b81f-4e83-ac34-f6d601b8a8d4',
    columnLabel: 'Status',
    originalLabel: 'state',
    type: FieldType.string,
    formatFunctionRef: FormatFunctionRef.status,
    source: FieldSource.fixField,
  },
]

export const fixFieldValueFunctions: Record<string, FixFieldValueGetter> = {
  '1a4b62c4-b81f-4e83-ac34-f6d601b8a8d4': (dossier) => dossier.state,
}
