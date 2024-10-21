import { IsDefined, IsString } from 'class-validator'
import { Address } from '@prisma/client'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { ApiProperty } from '@nestjs/swagger'

export class AddressEntity extends BaseEntity implements Address {
  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'L\'adresse complète',
      type: String,
    },
  )
  label: string

  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'Le type de l\'adresse',
      type: String,
    },
  )
  type: string

  @IsString()
  @ApiProperty(
    {
      description: 'Le complément d\'adresse',
      type: String,
    },
  )
  streetAddress: string | null

  @IsString()
  @ApiProperty(
    {
      description: 'Le numéro de rue',
      type: String,
    },
  )
  streetNumber: string | null

  @IsString()
  @ApiProperty(
    {
      description: 'Le nom de rue',
      type: String,
    },
  )
  streetName: string | null

  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'Le code postal',
      type: String,
    },
  )
  postalCode: string

  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'Le nom de la ville',
      type: String,
    },
  )
  cityName: string

  @IsString()
  @IsDefined()
  @ApiProperty(
    {
      description: 'Le code de la ville',
      type: String,
    },
  )
  cityCode: string

  @IsString()
  @ApiProperty(
    {
      description: 'Le nom du département',
      type: String,
    },
  )
  departmentName: string | null

  @IsString()
  @ApiProperty(
    {
      description: 'Le code du département',
      type: String,
    },
  )
  departmentCode: string

  @IsString()
  @ApiProperty(
    {
      description: 'Le nom de la région',
      type: String,
    },
  )
  regionName: string | null

  @IsString()
  @ApiProperty(
    {
      description: 'Le code de la région',
      type: String,
    },
  )
  regionCode: string | null
}
