import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { FileStorage } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'

export class FileStorageEntity extends BaseEntity implements FileStorage {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le UUID du fichier',
      type: String,
    },
  )
  uuid: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le nom du fichier',
      type: String,
    },
  )
  name: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le chemin du fichier',
      type: String,
    },
  )
  path: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le nom original du fichier',
      type: String,
    },
  )
  originalName: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le checksum du fichier',
      type: String,
    },
  )
  checksum: string

  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'La taille du fichier en octets',
      type: Number,
    },
  )
  byteSize: number

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty(
    {
      description: 'Le type MIME du fichier',
      type: String,
    },
  )
  mimeType: string

  @IsNumber()
  @ApiProperty(
    {
      description: 'L\'ID de la fondation',
      type: Number,
    },
  )
  foundationId: number | null

  foundation?: FoundationEntity
}
