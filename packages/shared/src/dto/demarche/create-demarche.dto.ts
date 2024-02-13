import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator'
import {
  OrganismeType,
  OrganismeTypeKeys,
} from '@biblio-num/shared-utils'

import {
  IdentificationDemarche,
  IdentificationDemarcheKeys,
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
