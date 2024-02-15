import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator'
import {
  OrganismeType,
  OrganismeTypeKeys,
  IdentificationDemarche,
  IdentificationDemarcheKeys,
} from '@biblio-num/shared-utils'

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
