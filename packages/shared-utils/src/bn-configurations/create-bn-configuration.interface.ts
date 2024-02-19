import type { BnConfigurationMandatoryDataKeys, BnConfigurationTypesKeys } from './enums'

export interface ICreateBnConfiguration {
  keyName: BnConfigurationMandatoryDataKeys
  stringValue: string
  valueType: BnConfigurationTypesKeys
}
