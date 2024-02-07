export const BnConfigurationTypes = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  JSON: 'json',
  DATE: 'date',
}

export type BnConfigurationTypesKeys = (typeof BnConfigurationTypes)[keyof typeof BnConfigurationTypes]
