import { PartialType } from '@nestjs/swagger'
import { DemarcheOptionOutputDto } from '@/modules/demarches/objects/dtos/demarche-option-output.dto'

export class DemarcheOptionInputDto extends PartialType(
  DemarcheOptionOutputDto,
) {}
