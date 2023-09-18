import { Controller, Get, Param, Response, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileService } from '../providers/file.service'
import { AuthenticatedGuard } from '@/modules/auth/providers/authenticated.guard'
import { DownloadFileInputDto } from '../objects/dto/inputs/download-file-input.dto'

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor (private readonly filesService: FileService) {}

  @UseGuards(AuthenticatedGuard)
  @Get(':uuid')
  async download (@Param() params: DownloadFileInputDto, @Response() response): Promise<void> {
    const file = await this.filesService.getFile(params.uuid)
    file.stream.pipe(response)
  }
}
