import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator'

export class DownloadMultipleFilesDto {
  @ApiProperty({
    description: 'Liste des UUIDs des fichiers à télécharger',
    isArray: true,
    type: String,
    format: 'uuid',
    example: ['9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'],
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  fileIds: string[]
}
