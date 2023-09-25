import { Foundation, FoundationType } from '@prisma/client'
import {
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator'
import { PersonInFoundationEntity } from '@/modules/foundation/objects/person-in-foundation.entity'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { AddressEntity } from '@/shared/objects/address/address.entity'
import { FileStorageEntity } from '@/modules/file-storage/objects/entities/file-storage.entity'

export class FoundationEntity extends BaseEntity implements Foundation {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  rnfId: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  title: string

  @IsEnum(FoundationType)
  @IsDefined()
  type: FoundationType

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  department: string

  @IsString()
  @IsDefined()
  @IsEmail()
  email: string

  @IsString()
  @IsDefined()
  @IsPhoneNumber()
  phone: string

  @IsDefined()
  @IsNumber()
  addressId: number

  @IsOptional()
  @IsDate()
  dissolvedAt: Date | null

  status?: FileStorageEntity | null
  address?: AddressEntity
  persons?: PersonInFoundationEntity[]
}
