import { createEnum } from '../../factories'

const bnConfigurationTypes = [
  'string',
  'number',
  'boolean',
  'json',
  'date',
] as const

export type BnConfigurationTypeKey = typeof bnConfigurationTypes[number]

export const eBnConfigurationType = createEnum(bnConfigurationTypes)
