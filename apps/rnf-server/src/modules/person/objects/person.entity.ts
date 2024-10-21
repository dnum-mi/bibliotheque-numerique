import { Person as PrismaPerson } from '@prisma/client'
import { IsBoolean, IsDate, IsDefined, IsEmail, IsNumber, IsPhoneNumber, IsString } from 'class-validator'
import { AddressEntity } from '@/shared/objects/address/address.entity'
import { PersonInFoundationEntity } from '@/modules/foundation/objects/person-in-foundation.entity'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { ApiProperty } from '@nestjs/swagger'

export class PersonEntity extends BaseEntity implements PrismaPerson {
  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'Le nom de famille de la personne',
      type: String,
    },
  )
  lastName: string

  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'Le prénom de la personne',
      type: String,
    },
  )
  firstName: string

  @IsString()
  @ApiProperty(
    {
      description: 'La civilité de la personne',
      type: String,
    },
  )
  civility: string

  @IsString()
  @IsDefined()
  @IsEmail()
  @ApiProperty(
    {
      description: 'L\'adresse email de la personne',
      type: String,
    },
  )
  email: string

  @IsString()
  @IsDefined()
  @IsPhoneNumber()
  @ApiProperty(
    {
      description: 'Le numéro de téléphone de la personne',
      type: String,
    },
  )
  phone: string

  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'La profession de la personne',
      type: String,
    },
  )
  profession: string

  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'La nationalité de la personne',
      type: String,
    },
  )
  nationality: string

  @IsDate()
  @IsDefined()
  @ApiProperty(
    {
      description: 'La date de naissance de la personne',
      type: Date,
    },
  )
  bornAt: Date | null

  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'Le lieu de naissance de la personne',
      type: String,
    },
  )
  bornPlace: string

  @IsBoolean()
  @IsDefined()
  @ApiProperty(
    {
      description: 'Si la personne est un fondateur',
      type: Boolean,
    },
  )
  isFounder: boolean

  @IsDefined()
  @IsNumber()
  @ApiProperty(
    {
      description: 'L\'ID de l\'adresse de la personne',
      type: Number,
    },
  )
  addressId: number

  address: AddressEntity

  foundations?: PersonInFoundationEntity[]
}
