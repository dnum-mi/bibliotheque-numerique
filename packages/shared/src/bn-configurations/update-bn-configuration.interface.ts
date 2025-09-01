import type { BnConfigurationKey, BnConfigurationTypeKey } from './enums'

export class IUpdateBnConfiguration {
  keyName?: BnConfigurationKey
  stringValue?: string
  valueType?: BnConfigurationTypeKey | null
}
