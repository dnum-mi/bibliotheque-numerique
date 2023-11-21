import { Controller, Get, Param, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileService } from '../providers/file.service'
import { DownloadFileInputDto } from '../objects/dto/inputs/download-file-input.dto'
import { Role } from '@/modules/users/providers/decorators/role.decorator'

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor(private readonly filesService: FileService) {}

  @Get(':uuid')
  @Role('any')
  async download(
    @Param() params: DownloadFileInputDto,
    @Response() response,
  ): Promise<void> {
    const file = await this.filesService.getFile(params.uuid)
    response.setHeader('Content-Disposition', `attachment; filename="${file.info.originalName}"`)
    file.stream.pipe(response)
  }
}
