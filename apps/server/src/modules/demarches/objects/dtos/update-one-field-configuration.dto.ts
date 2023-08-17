import { IsDefined, ValidateIf } from 'class-validator'

export class UpdateOneFieldConfigurationDto {
  @IsDefined()
  @ValidateIf((o) => o.columnLabel === null || o.columnLabel instanceof String,
    { message: 'columnLabel must be a string or null' })
  columnLabel: string | null
}
