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
  [eBnConfiguration.LAST_ORGANISM_SYNC_AT]: {
    stringValue: (new Date(0)).toISOString(),
    type: eBnConfigurationType.date,
  },
  [eBnConfiguration.LAST_FOUNDATION_SYNC_AT]: {
    stringValue: (new Date(0)).toISOString(),
    type: eBnConfigurationType.date,
  },
  [eBnConfiguration.DDC_FIRST_CONTROL_YEAR]: {
    stringValue: '2020',
    type: eBnConfigurationType.number,
  },
  [eBnConfiguration.DDC_MONTH_BEFORE_MISSING]: {
    stringValue: '6',
    type: eBnConfigurationType.number,
  },
  [eBnConfiguration.ENABLE_HUB_SEARCH]: {
    stringValue: 'false',
    type: eBnConfigurationType.boolean,
  },
  [eBnConfiguration.SYNC_RNA_VIA_HUB]: {
    stringValue: 'false',
    type: eBnConfigurationType.boolean,
  },
  [eBnConfiguration.SYNC_RNF_VIA_HUB]: {
    stringValue: 'false',
    type: eBnConfigurationType.boolean,
  },

}
