export const FieldType = {
  string: 'string',
  number: 'number',
  date: 'date',
  boolean: 'boolean',
  file: 'file',
}

export type FieldTypeKeys = (typeof FieldType)[keyof typeof FieldType];
