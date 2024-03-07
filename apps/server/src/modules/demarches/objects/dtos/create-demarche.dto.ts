import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator'
import {
  eOrganismeType,
  OrganismeTypeKey,
  IdentificationDemarche,
  IdentificationDemarcheKeys,
  ICreateDemarche,
} from '@biblio-num/shared'

export class CreateDemarcheDto implements ICreateDemarche {
  @IsNumber()
  idDs: number

  @IsOptional()
  @IsEnum(IdentificationDemarche)
  identification: IdentificationDemarcheKeys

  @IsOptional()
  @IsEnum(eOrganismeType, { each: true })
  @IsArray()
  types: OrganismeTypeKey[]
}
