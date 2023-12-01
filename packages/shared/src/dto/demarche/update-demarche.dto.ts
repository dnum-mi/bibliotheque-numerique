import { IsArray, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import {
  IdentificationDemarche,
  IdentificationDemarcheKeys,
  OrganismeType,
  OrganismeTypeKeys,
} from '@biblio-num/shared'

export class UpdateDemarcheDto {
  @IsOptional()
  @ValidateIf((o) => o.identification !== null)
  @IsEnum(IdentificationDemarche)
  identification?: IdentificationDemarcheKeys

  @IsOptional()
  @ValidateIf((o) => o.types !== null)
  @IsEnum(OrganismeType, { each: true })
  @IsArray()
  types?: OrganismeTypeKeys[]
}
