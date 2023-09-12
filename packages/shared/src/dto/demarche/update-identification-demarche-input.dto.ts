import { IsEnum, IsOptional } from 'class-validator'
import { IdentificationDemarche, IdentificationDemarcheKeys } from '../../enums'

export class UpdateIdentificationDemarcheInputDto {
  @IsOptional()
  @IsEnum(IdentificationDemarche)
  identification?: IdentificationDemarcheKeys
}
