import { Person as PrismaPerson } from '@prisma/client'
import { IsDate, IsDefined, IsEmail, IsNumber, IsPhoneNumber, IsString } from 'class-validator'
import { AddressEntity } from '@/shared/objects/address/address.entity'
import { PersonInFoundationEntity } from '@/modules/foundation/objects/person-in-foundation.entity'
import { BaseEntity } from '@/shared/base-entity/base.entity'

export class PersonEntity extends BaseEntity implements PrismaPerson {
  @IsString()
  @IsDefined()
  lastName: string

  @IsString()
  @IsDefined()
  firstName: string

  @IsString()
  civility: string

  @IsString()
  @IsDefined()
  @IsEmail()
  email: string

  @IsString()
  @IsDefined()
  @IsPhoneNumber()
  phone: string

  @IsString()
  @IsDefined()
  profession: string

  @IsString()
  @IsDefined()
  nationality: string

  @IsDate()
  @IsDefined()
  bornAt: Date

  @IsString()
  @IsDefined()
  bornPlace: string

  @IsDefined()
  @IsNumber()
  addressId: number

  address: AddressEntity

  foundations?: PersonInFoundationEntity[]
}
