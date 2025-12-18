import { createEnum } from '../../factories'

const bnConfigurations = [
  'FE_EXCEL_IMPORT_SHEET_NAME',
  'FE_EXCEL_IMPORT_RANGE',
  'FE_AMOUNT_CHAMP_TAG',
  'FILE_MAXIMUM_SIZE',
] as const

export type BnConfigurationKey = typeof bnConfigurations[number]

export const eBnConfiguration = createEnum(bnConfigurations)
