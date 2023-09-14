import { Controller, Get, Param, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileStorageService } from '../providers/file-storage.service'
import { DownloadFileInputDto } from '@/modules/file-storage/objects/dto/inputs/download-file-input.dto'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'

@ApiTags('Files')
@Controller('files')
export class FileStorageController {
  constructor (
    private readonly filesService: FileStorageService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get(':uuid')
  async download (@Param() params: DownloadFileInputDto, @Response() response): Promise<void> {
    this.logger.verbose('download')
    const file = await this.filesService.getFile(params.uuid)
    file.stream.pipe(response)
  }
}
