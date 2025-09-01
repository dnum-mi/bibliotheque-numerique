import type { BnConfigurationKey, BnConfigurationTypeKey } from './enums'

export interface ICreateBnConfiguration {
  keyName: BnConfigurationKey
  stringValue: string
  valueType: BnConfigurationTypeKey
}
