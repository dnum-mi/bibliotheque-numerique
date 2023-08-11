import type { Express } from 'express'
import { Body, Controller, Get, Param, Post, Response, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileStorageService } from '../providers/file-storage.service'
import { FileStorageEntity } from '../objects/entities/file-storage.entity'

@ApiTags('Files')
@Controller('files')
export class FileStorageController {
  constructor (private readonly filesService: FileStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile (@UploadedFile() file: Express.Multer.File): Promise<FileStorageEntity> {
    return this.filesService.uploadFile(file)
  }

  @Get(':uuid')
  async download (@Param('uuid') uuid: string, @Response() response): Promise<void> {
    const file = await this.filesService.getFile(uuid)
    file.stream.pipe(response)
  }

  @Post('copy')
  async copyFile (
    @Body('fileUrl') fileUrl: string,
    @Body('fileName') fileName: string,
    @Body('checksum') checksum: string,
    @Body('mimeType') mimeType: string,
    @Body('byteSize') byteSize: string,
  ): Promise<FileStorageEntity> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return await this.filesService.copyRemoteFile(fileUrl, checksum, byteSize, mimeType, fileName)
  }
}
