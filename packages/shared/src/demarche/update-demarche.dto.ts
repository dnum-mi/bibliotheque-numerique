import { IsArray, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import {
  OrganismeType,
  OrganismeTypeKeys,
  IdentificationDemarche,
  IdentificationDemarcheKeys,
} from '@biblio-num/shared-utils'

export class UpdateDemarcheDto {
  @IsOptional()
  @ValidateIf((o) => o.identification !== null)
  @IsEnum(IdentificationDemarche)
  identification?: IdentificationDemarcheKeys | null

  @IsOptional()
  @ValidateIf((o) => o.types !== null)
  @IsEnum(OrganismeType, { each: true })
  @IsArray()
  types?: OrganismeTypeKeys[]
}
