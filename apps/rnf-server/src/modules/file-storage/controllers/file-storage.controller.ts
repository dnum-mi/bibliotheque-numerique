import { Controller, Get, Param, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileStorageService } from '../providers/file-storage.service'
import { DownloadFileInputDto } from '@/modules/file-storage/objects/dto/inputs/download-file-input.dto'

@ApiTags('Files')
@Controller('files')
export class FileStorageController {
  constructor (private readonly filesService: FileStorageService) {}

  @Get(':uuid')
  async download (@Param() params: DownloadFileInputDto, @Response() response): Promise<void> {
    const file = await this.filesService.getFile(params.uuid)
    file.stream.pipe(response)
  }
}
