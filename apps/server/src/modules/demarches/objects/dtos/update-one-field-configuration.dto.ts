import { IUpdateOneFieldConfiguration } from '@biblio-num/shared'
import { IsOptional, IsString, ValidateIf } from 'class-validator'
import { PickType } from '@nestjs/swagger'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'

export class UpdateOneFieldConfigurationDto
  extends PickType(MappingColumn, ['columnLabel'])
  implements IUpdateOneFieldConfiguration {
  @ValidateIf((o) => o.columnLabel !== undefined)
  @IsOptional()
  @IsString()
  columnLabel: string | null
}
