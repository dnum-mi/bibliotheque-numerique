import type { Express } from 'express'
import { Body, Controller, Get, Param, Post, Response, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileService } from '../providers/file.service'
import { AuthenticatedGuard } from '@/modules/auth/providers/authenticated.guard'
import { DownloadFileInputDto } from '../objects/dto/inputs/download-file-input.dto'
import { FileStorageOutputDto } from '@/modules/files/objects/dto/outputs/file-storage-output.dto'

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor (private readonly filesService: FileService) {}

  @UseGuards(AuthenticatedGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile (@UploadedFile() file: Express.Multer.File): Promise<FileStorageOutputDto> {
    return this.filesService.uploadFile(file)
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':uuid')
  async download (@Param() params: DownloadFileInputDto, @Response() response): Promise<void> {
    const file = await this.filesService.getFile(params.uuid)
    file.stream.pipe(response)
  }

  @UseGuards(AuthenticatedGuard)
  @Post('copy')
  async copyFile (
    @Body('fileUrl') fileUrl: string,
    @Body('fileName') fileName: string,
    @Body('checksum') checksum: string,
    @Body('mimeType') mimeType: string,
    @Body('byteSize') byteSize: string,
  ): Promise<FileStorageOutputDto> {
    return await this.filesService.copyRemoteFile(fileUrl, checksum, byteSize, mimeType, fileName)
  }
}
