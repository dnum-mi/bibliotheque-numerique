import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import {
  BnConfigurationKeyNames,
  BnConfigurationMandatoryDataKeys,
  BnConfigurationTypes,
  BnConfigurationTypesKeys,
} from '@biblio-num/shared-utils'

export class CreateBnConfigurationDto {
  @IsEnum(BnConfigurationKeyNames)
  @IsNotEmpty()
  keyName: BnConfigurationMandatoryDataKeys

  @IsNotEmpty()
  stringValue: string

  @IsEnum(BnConfigurationTypes)
  @IsNotEmpty()
  valueType: BnConfigurationTypesKeys
}
