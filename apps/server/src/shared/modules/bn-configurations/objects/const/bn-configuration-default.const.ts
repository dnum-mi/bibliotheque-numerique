import {
  BnConfigurationKey,
  BnConfigurationTypeKey,
  eBnConfiguration,
  eBnConfigurationType,
} from '@biblio-num/shared'
import { addYears } from 'date-fns'

type OneDefaultConfiguration = {
  stringValue: string
  type: BnConfigurationTypeKey
}

export const BnConfigurationDefault: Record<
  BnConfigurationKey,
  OneDefaultConfiguration
> = {
  [eBnConfiguration.FE_EXCEL_IMPORT_SHEET_NAME]: {
    stringValue: 'Déclaration des FE',
    type: eBnConfigurationType.string,
  },
  [eBnConfiguration.FE_EXCEL_IMPORT_RANGE]: {
    stringValue: 'B4:H502',
    type: eBnConfigurationType.string,
  },
  [eBnConfiguration.FILE_MAXIMUM_SIZE]: {
    stringValue: 'Q2hhbXAtMTA1MA==',
    type: eBnConfigurationType.string,
  },
  [eBnConfiguration.LAST_ORGANISM_SYNC_AT]: {
    stringValue: addYears(new Date(), -1).toISOString(),
    type: eBnConfigurationType.date,
  },
}
