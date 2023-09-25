import { PickType } from '@nestjs/swagger'
import { FileStorageEntity } from '@/modules/file-storage/objects/entities/file-storage.entity'
import { IsDefined, IsString } from 'class-validator'

export const fileStorageKeys: (keyof FileStorageEntity)[] = [
  'originalName',
  'checksum',
  'byteSize',
  'mimeType',
]

export class CreateFileStorageDto extends PickType(FileStorageEntity, fileStorageKeys) {
  @IsDefined()
  @IsString()
  fileUrl: string
}
