import { FieldSource, FieldType, FormatFunctionRef, MappingColumn } from '@biblio-num/shared'

export const fixFieldInstructionTimeDelay: MappingColumn = {
  id: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
  columnLabel: null,
  originalLabel: 'Temps restant',
  type: FieldType.number,
  source: FieldSource.fixField,
  formatFunctionRef: FormatFunctionRef.remainingTime,
}

export const fixFieldInstructionTimeStatus: MappingColumn = {
  id: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
  columnLabel: null,
  originalLabel: 'Etat délai',
  type: FieldType.string,
  source: FieldSource.fixField,
  formatFunctionRef: FormatFunctionRef.delayStatus,
}

export const fixFieldsInstructionTime: MappingColumn[] = [
  fixFieldInstructionTimeDelay,
  fixFieldInstructionTimeStatus,
]
