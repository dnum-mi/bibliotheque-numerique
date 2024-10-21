import { Foundation, FoundationType } from '@prisma/client'
import {
  IsArray,
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
import { ApiProperty } from '@nestjs/swagger'

export class FoundationEntity extends BaseEntity implements Foundation {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le numéro de RNF de la fondation',
      type: String,
      example: '075-FDD-00003-02',
    },
  )
  rnfId: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le titre de la fondation',
      type: String,
      example: 'Fondation de France',
    },
  )
  title: string

  @IsEnum(FoundationType)
  @IsDefined()
  @ApiProperty(
    {
      description: 'Le type de la fondation',
      enum: FoundationType,
    },
  )
  type: FoundationType

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le département de la fondation',
      type: String,
      example: 'Paris',
    },
  )
  department: string

  @IsString()
  @IsDefined()
  @IsEmail()
  @ApiProperty(
    {
      description: 'L\'email de la fondation',
      type: String,
      example: 'email@example.fr',
    },
  )
  email: string

  @IsString()
  @IsDefined()
  @IsPhoneNumber()
  @ApiProperty(
    {
      description: 'Le téléphone de la fondation',
      type: String,
      example: '0102030405',
    },
  )
  phone: string

  @IsDefined()
  @IsNumber()
  addressId: number

  @IsOptional()
  @IsDate()
  @ApiProperty(
    {
      description: 'La date de dissolution de la fondation',
      type: Date,
    },
  )
  dissolvedAt: Date | null

  @IsDefined()
  @IsDate()
  @ApiProperty(
    {
      description: 'La date de création de la fondation',
      type: Date,
    },
  )
  originalCreatedAt: Date

  @IsOptional()
  @IsDate()
  @ApiProperty(
    {
      description: 'La date de fin d\'exercice de la fondation',
      type: Date,
    },
  )
  fiscalEndDateAt: Date | null

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty(
    {
      description: 'Les années de déclaration de la fondation',
      type: [Number],
      example: [2019, 2020, 2021],
    },
  )
  declarationYears: number[]

  status?: FileStorageEntity | null

  @ApiProperty(
    {
      description: 'L\'adresse de la fondation',
      type: AddressEntity,
    },
  )
  address?: AddressEntity

  persons?: PersonInFoundationEntity[]
}
