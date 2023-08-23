import type { Express } from 'express'
import { Body, Controller, Get, Param, Post, Response, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileStorageService } from '../providers/file-storage.service'
import { FileStorageEntity } from '../objects/entities/file-storage.entity'
import { DownloadFileInputDto } from '@/modules/file-storage/objects/dto/inputs/download-file-input.dto'

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
  async download (@Param() params: DownloadFileInputDto, @Response() response): Promise<void> {
    const file = await this.filesService.getFile(params.uuid)
    file.stream.pipe(response)
  }

  @Post('copy')
  async copyFile (
    @Body('fileUrl') fileUrl: string,
    @Body('fileName') fileName: string,
    @Body('checksum') checksum: string,
    @Body('mimeType') mimeType: string,
    @Body('byteSize') byteSize: number,
  ): Promise<FileStorageEntity> {
    return await this.filesService.copyRemoteFile(fileUrl, fileName, checksum, byteSize, mimeType)
  }
}
