import { IsEnum, IsOptional, ValidateIf } from 'class-validator'
import { IdentificationDemarche, IdentificationDemarcheKeys } from '../../enums'

export class UpdateIdentificationDemarcheInputDto {
  @ValidateIf(o => o.identification !== null)
  @IsEnum(IdentificationDemarche)
  identification?: IdentificationDemarcheKeys
}
