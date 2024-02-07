import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator'
import {
  BnConfigurationTypes,
  BnConfigurationTypesKeys,
} from '@biblio-num/shared'

export class UpdateBnConfigurationDto {
  @IsOptional()
  @ValidateIf((o) => o.keyName !== null)
  @IsString()
  keyName?: string

  @IsOptional()
  @ValidateIf((o) => o.value !== null)
  @IsString()
  value?: string

  @IsOptional()
  @ValidateIf((o) => o.valueType !== null)
  @IsEnum(BnConfigurationTypes)
  @IsString()
  valueType?: BnConfigurationTypesKeys | null
}
