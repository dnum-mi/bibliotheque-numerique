import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Response,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileService } from '../providers/file.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { S3Service } from '@/shared/modules/s3/s3.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { isUUID } from 'class-validator'
import { Roles, eState } from '@biblio-num/shared'

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor(
    private readonly logger: LoggerService,
    private readonly s3Service: S3Service,
    private readonly filesService: FileService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get(':uuid')
  @Role(Roles.instructor)
  async download(
    @Param('uuid') uuid: string,
    @Response() response,
  ): Promise<void> {
    this.logger.verbose('download file')
    if (!isUUID(uuid)) {
      throw new BadRequestException('uuid is not valid')
    }
    const smallFile = await this.filesService.findOneWithUuid(uuid)
    if (smallFile.state !== eState.uploaded) {
      throw new BadRequestException('file is not ready yet.')
    }
    this.logger.debug(smallFile)
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${FileService.buildCompleteName(smallFile)}"`,
    )
    const stream = await this.s3Service.getStreamedFile(uuid)
    stream.pipe(response)
  }
}
