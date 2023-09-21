import { OmitType } from '@nestjs/swagger'
import { FileStorage } from '@/modules/files/objects/entities/file-storage.entity'

export class FileStorageOutputDto extends OmitType(FileStorage, ['name', 'path']) {
}
