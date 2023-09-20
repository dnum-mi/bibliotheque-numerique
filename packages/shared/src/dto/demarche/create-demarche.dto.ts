import { IsEnum, IsNumber, IsOptional } from 'class-validator'
import { IdentificationDemarche, IdentificationDemarcheKeys } from '../../enums'

export class CreateDemarcheDto {
  @IsNumber()
  idDs: number

  @IsOptional()
  @IsEnum(IdentificationDemarche)
  identification: IdentificationDemarcheKeys
}
