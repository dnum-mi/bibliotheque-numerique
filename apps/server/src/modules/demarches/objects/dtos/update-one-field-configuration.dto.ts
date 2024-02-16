import { IUpdateOneFieldConfiguration } from '@biblio-num/shared-utils'
import { IsOptional, IsString, ValidateIf } from 'class-validator'

export class UpdateOneFieldConfigurationDto implements IUpdateOneFieldConfiguration {
  @ValidateIf(o => o.columnLabel !== undefined)
  @IsOptional()
  @IsString()
  columnLabel: string | null
}
