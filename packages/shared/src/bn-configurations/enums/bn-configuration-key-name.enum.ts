export const BnConfigurationMandatoryData = {
  EXCEL_IMPORT_SHEET_NAME: 'Déclaration des FE',
  EXCEL_IMPORT_RANGE: 'B4:H502',
  EXCEL_IMPORT_CHAMP_ID: 'Q2hhbXAtNTg=',
  EXCEL_IMPORT_AMOUNT_CHAMP_ID: 'Q2hhbXAtMTA1MA==',
}

export const BnConfigurationKeyNames = Object.keys(BnConfigurationMandatoryData)

export type BnConfigurationMandatoryDataKeys =
  (typeof BnConfigurationMandatoryData)[keyof typeof BnConfigurationMandatoryData]
