import { IsEnum, IsNotEmpty } from 'class-validator'
import {
  BnConfigurationKeyNames,
  BnConfigurationMandatoryDataKeys,
  BnConfigurationTypes,
  BnConfigurationTypesKeys,
  ICreateBnConfiguration,
} from '@biblio-num/shared-utils'

export class CreateBnConfigurationDto implements ICreateBnConfiguration {
  @IsEnum(BnConfigurationKeyNames)
  @IsNotEmpty()
  keyName: BnConfigurationMandatoryDataKeys

  @IsNotEmpty()
  stringValue: string

  @IsEnum(BnConfigurationTypes)
  @IsNotEmpty()
  valueType: BnConfigurationTypesKeys
}
