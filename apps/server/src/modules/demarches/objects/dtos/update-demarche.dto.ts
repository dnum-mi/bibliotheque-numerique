import { IsArray, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import {
  eOrganismeType,
  OrganismeTypeKey,
  eIdentificationDemarche,
  IdentificationDemarcheKey,
  IUpdateDemarche,
} from '@biblio-num/shared'

export class UpdateDemarcheDto implements IUpdateDemarche {
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
