import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator'
import {
  IdentificationDemarche,
  IdentificationDemarcheKeys,
  OrganismeType,
  OrganismeTypeKeys,
} from '../../enums'

export class CreateDemarcheDto {
  @IsNumber()
  idDs: number

  @IsOptional()
  @IsEnum(IdentificationDemarche)
  identification: IdentificationDemarcheKeys

  @IsOptional()
  @IsEnum(OrganismeType, { each: true })
  @IsArray()
  types: OrganismeTypeKeys[]
}
