import { createEnum } from '../../factories'

const bnConfigurations = [
  'FE_EXCEL_IMPORT_SHEET_NAME',
  'FE_EXCEL_IMPORT_RANGE',
  'FE_EXCEL_AMOUNT_CHAMP_ID',
  'FILE_MAXIMUM_SIZE',
  'LAST_ORGANISM_SYNC_AT',
] as const

export type BnConfigurationKey = typeof bnConfigurations[number]

export const eBnConfiguration = createEnum(bnConfigurations)
