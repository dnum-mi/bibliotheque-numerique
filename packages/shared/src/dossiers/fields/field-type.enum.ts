export const FieldType = {
  string: 'string',
  number: 'number',
  numbers: 'numbers',
  enum: 'enum',
  date: 'date',
  boolean: 'boolean',
  file: 'file',
} as const

export type FieldTypeKeys = (typeof FieldType)[keyof typeof FieldType];
