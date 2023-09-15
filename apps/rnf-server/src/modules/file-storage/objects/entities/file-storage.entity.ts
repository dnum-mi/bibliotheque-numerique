import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { FileStorage } from '@prisma/client'

export class FileStorageEntity extends BaseEntity implements FileStorage {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
    uuid: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
    name: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
    path: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
    originalName: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
    checksum: string

  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
    byteSize: number

  @IsString()
  @IsDefined()
  @IsNotEmpty()
    mimeType: string

  @IsNumber()
    foundationId: number

  foundation?: FoundationEntity
}
