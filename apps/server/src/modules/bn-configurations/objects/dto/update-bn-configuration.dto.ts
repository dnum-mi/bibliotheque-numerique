import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator'
import {
  BnConfigurationKeyNames,
  BnConfigurationMandatoryDataKeys,
  BnConfigurationTypes,
  BnConfigurationTypesKeys,
  IUpdateBnConfiguration,
} from '@biblio-num/shared'

export class UpdateBnConfigurationDto implements IUpdateBnConfiguration {
  @IsOptional()
  @ValidateIf((o) => o.value !== null)
  @IsEnum(BnConfigurationKeyNames)
  @IsString()
  keyName?: BnConfigurationMandatoryDataKeys | null

  @IsOptional()
  @ValidateIf((o) => o.value !== null)
  @IsString()
  stringValue?: string

  @IsOptional()
  @ValidateIf((o) => o.valueType !== null)
  @IsEnum(BnConfigurationTypes)
  @IsString()
  valueType?: BnConfigurationTypesKeys | null
}
