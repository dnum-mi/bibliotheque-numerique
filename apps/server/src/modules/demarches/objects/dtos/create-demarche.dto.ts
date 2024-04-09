import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator'
import {
  eOrganismeType,
  OrganismeTypeKey,
  eIdentificationDemarche,
  IdentificationDemarcheKey,
  ICreateDemarche,
} from '@biblio-num/shared'

export class CreateDemarcheDto implements ICreateDemarche {
  @IsNumber()
  idDs: number

  @IsOptional()
  @IsEnum(eIdentificationDemarche)
  identification: IdentificationDemarcheKey

  @IsOptional()
  @IsEnum(eOrganismeType, { each: true })
  @IsArray()
  types: OrganismeTypeKey[]
}
