import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { PaginationFileDto } from '@/modules/files/objects/dto/pagination-file.dto'
import { PaginatedFileDto } from '@/modules/files/objects/dto/paginated-file.dto'
import { FileService } from '@/modules/files/providers/file.service'
import { Roles } from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { CurrentDossierInterceptor } from '@/modules/dossiers/providers/current-dossier.interceptor'

@ApiTags('Dossier')
@ApiTags('Files')
@UseInterceptors(CurrentDossierInterceptor)
@Controller('dossiers/:dossierId/files')
export class DossierFileController {
  constructor(
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post('list')
  @HttpCode(200)
  @Role(Roles.instructor)
  async listDossierFiles(
    @Body() dto: PaginationFileDto,
    @Param('dossierId') dossierId: number,
  ): Promise<PaginatedFileDto> {
    this.logger.verbose('listDossierFiles')
    return this.fileService.paginate(dto, {}, [
      `("o"."dossierId" = ${dossierId})`,
    ])
  }
}
