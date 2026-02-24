import { FieldType, FieldTypeKeys } from '@biblio-num/shared'

export const mapFieldTypeToSql = (type: FieldTypeKeys): string => {
  switch (type) {
    case FieldType.string:
    case FieldType.enum:
    case FieldType.boolean:
    case FieldType.file:
      return 'text'
    case FieldType.number:
    case FieldType.numbers:
      return 'numeric'
    case FieldType.date:
      return 'timestamp'
    default:
      throw new Error(`Unsupported field type: ${type}`)
  }
}
