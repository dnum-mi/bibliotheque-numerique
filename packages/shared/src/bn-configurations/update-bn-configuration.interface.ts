import type { BnConfigurationMandatoryDataKeys, BnConfigurationTypesKeys } from './enums'

export class IUpdateBnConfiguration {
  keyName?: BnConfigurationMandatoryDataKeys | null
  stringValue?: string
  valueType?: BnConfigurationTypesKeys | null
}
