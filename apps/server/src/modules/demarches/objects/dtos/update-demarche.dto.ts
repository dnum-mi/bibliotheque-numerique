import { IsArray, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import {
  eOrganismeType,
  OrganismeTypeKey,
  eIdentificationDemarche,
  IdentificationDemarcheKey,
  IUpdateDemarche,
} from '@biblio-num/shared'
import { PartialType, PickType } from '@nestjs/swagger'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

export class UpdateDemarcheDto
  extends PartialType(PickType(Demarche, ['identification', 'types']))
  implements IUpdateDemarche {
  @IsOptional()
  @ValidateIf((o) => o.identification !== null)
  @IsEnum(eIdentificationDemarche)
  identification?: IdentificationDemarcheKey | null

  @IsOptional()
  @ValidateIf((o) => o.types !== null)
  @IsEnum(eOrganismeType, { each: true })
  @IsArray()
  types?: OrganismeTypeKey[]
}
