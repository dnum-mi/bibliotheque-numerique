import { IUpdateAnonymizedChamp } from '@biblio-num/shared'
import { IsBoolean, IsOptional, ValidateIf } from 'class-validator'
import { PickType } from '@nestjs/swagger'
import { MappingAnonymized } from '@/modules/demarches/objects/dtos/mapping-anonymized.dto'

export class UpdateOneFieldAnonymizedDto
  extends PickType(MappingAnonymized, ['id'])
  implements IUpdateAnonymizedChamp {
  @ValidateIf((o) => o.add !== undefined)
  @IsOptional()
  @IsBoolean()
  add: boolean
}
