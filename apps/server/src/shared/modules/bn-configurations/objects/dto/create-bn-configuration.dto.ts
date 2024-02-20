import { IsEnum, IsString } from 'class-validator'

import {
  eBnConfiguration,
  BnConfigurationKey,
  ICreateBnConfiguration,
  BnConfigurationTypeKey,
  eBnConfigurationType,
} from '@biblio-num/shared'

export class CreateBnConfigurationDto implements ICreateBnConfiguration {
  @IsEnum(eBnConfiguration)
  @IsString()
  keyName: BnConfigurationKey | null

  @IsString()
  stringValue: string

  @IsEnum(eBnConfigurationType)
  @IsString()
  valueType: BnConfigurationTypeKey | null
}
