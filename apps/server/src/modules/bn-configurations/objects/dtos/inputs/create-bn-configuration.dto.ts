import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import {
  BnConfigurationTypes,
  BnConfigurationTypesKeys,
} from '@biblio-num/shared'

export class CreateBnConfigurationDto {
  @IsString()
  @IsNotEmpty()
  keyName: string

  @IsString()
  @IsNotEmpty()
  stringValue: string

  @IsEnum(BnConfigurationTypes)
  @IsString()
  @IsNotEmpty()
  valueType: BnConfigurationTypesKeys
}
