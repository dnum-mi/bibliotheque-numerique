import { IsDefined, IsString } from 'class-validator'

export class UpdateOneFieldConfigurationDto {
  @IsDefined()
  @IsString()
  columnLabel: string
}
