import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator'
import {
  BnConfigurationKeyNames,
  BnConfigurationMandatoryDataKeys,
  BnConfigurationTypes,
  BnConfigurationTypesKeys,
} from '@biblio-num/shared-utils'

export class UpdateBnConfigurationDto {
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
