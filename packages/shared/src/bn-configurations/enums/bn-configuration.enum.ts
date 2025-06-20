import { createEnum } from '../../factories'

const bnConfigurations = [
  'FE_EXCEL_IMPORT_SHEET_NAME',
  'FE_EXCEL_IMPORT_RANGE',
  'FE_AMOUNT_CHAMP_TAG',
  'FILE_MAXIMUM_SIZE',
  'LAST_ORGANISM_SYNC_AT',
  'LAST_FOUNDATION_SYNC_AT',
  'DDC_FIRST_CONTROL_YEAR',
  'DDC_MONTH_BEFORE_MISSING',
  'ENABLE_SIAF', // TODO: A supprimer à apres avoir finit le syncho hub
  'ENABLE_HUB_SEARCH',
  'SYNC_RNA_VIA_HUB',
  'SYNC_RNF_VIA_HUB',
] as const

export type BnConfigurationKey = typeof bnConfigurations[number]

export const eBnConfiguration = createEnum(bnConfigurations)
