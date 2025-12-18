import {
  BnConfigurationKey,
  BnConfigurationTypeKey,
  eBnConfiguration,
  eBnConfigurationType,
} from '@biblio-num/shared'

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
  [eBnConfiguration.FE_AMOUNT_CHAMP_TAG]: {
    stringValue: 'fe-amount-champ',
    type: eBnConfigurationType.string,
  },
  [eBnConfiguration.FILE_MAXIMUM_SIZE]: {
    stringValue: '5242880',
    type: eBnConfigurationType.number,
  },
}
