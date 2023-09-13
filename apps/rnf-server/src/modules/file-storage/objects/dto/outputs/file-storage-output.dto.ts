import { OmitType } from '@nestjs/swagger'
import { FileStorageEntity } from '@/modules/file-storage/objects/entities/file-storage.entity'

export class FileStorageOutputDto extends OmitType(FileStorageEntity, ['name', 'path']) {}
