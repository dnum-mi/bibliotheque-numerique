import { IsOptional, IsString, ValidateIf } from 'class-validator'

export class UpdateOneFieldConfigurationDto {
  @ValidateIf(o => o.columnLabel !== undefined)
  @IsOptional()
  @IsString()
  columnLabel: string | null
}
