import { Body, Controller, Get, HttpCode, Param, Post, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentOrganismeInterceptor } from '@/modules/organismes/providers/current-organisme.interceptor'
import { PaginationFileDto } from '@/modules/files/objects/dto/pagination-file.dto'
import { PaginatedFileDto } from '@/modules/files/objects/dto/paginated-file.dto'
import { FileService } from '@/modules/files/providers/file.service'
import { FileTabTagKey, Roles } from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'

@ApiTags('Organisme')
@ApiTags('Files')
@UseInterceptors(CurrentOrganismeInterceptor)
@Controller('organismes/:organismeId/files')
export class OrganismeFileController {
  constructor(
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post('list')
  @HttpCode(200)
  @Role(Roles.instructor)
  async listOrganismeFiles(
    @Body() dto: PaginationFileDto,
    @Param('organismeId') organismeId: number,
  ): Promise<PaginatedFileDto> {
    this.logger.verbose('listOrganismeFiles')
    return this.fileService.paginate(dto, {}, [
      `("o"."organismeId" = ${organismeId})`,
    ])
  }

  @Get('summary')
  @Role(Roles.instructor)
  async getOrganismeFileSummary(
    @Param('organismeId') organismeId: number,
  ): Promise<Record<FileTabTagKey, number>> {
    this.logger.verbose('getOrganismeFileSummary')
    return this.fileService.getOrganismeFileSummary(organismeId)
  }
}
