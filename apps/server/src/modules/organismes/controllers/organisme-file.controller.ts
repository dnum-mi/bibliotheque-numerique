import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentOrganismeInterceptor } from '@/modules/organismes/providers/current-organisme.interceptor'
import { PaginationFileDto } from '@/modules/files/objects/dto/pagination-file.dto'
import { PaginatedFileDto } from '@/modules/files/objects/dto/paginated-file.dto'
import { FileService } from '@/modules/files/providers/file.service'
import { FileTagKey, Roles } from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'

@ApiTags('Organismes', 'Files')
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

  @UsualApiOperation({
    summary: 'Lister les fichier d\'un organisme.',
    method: 'POST',
    minimumRole: Roles.instructor,
    isPagination: true,
    responseType: PaginatedFileDto,
  })
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

  @ApiOperation({
    summary: "Résumé des fichiers d'un organisme",
    description:
      "Résumé des fichiers d'un organisme à partir de son id. Retourne le nombre de ficher dans chaque catégorie.",
  })
  @UsualApiOperation({
    summary: 'Résumé des fichiers d\'un organisme',
    supplement: 'Retourne le nombre de ficher dans chaque catégorie.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Get('summary')
  @Role(Roles.instructor)
  async getOrganismeFileSummary(
    @Param('organismeId') organismeId: number,
  ): Promise<Record<FileTagKey, number>> {
    this.logger.verbose('getOrganismeFileSummary')
    return this.fileService.getOrganismeFileSummary(organismeId)
  }
}
