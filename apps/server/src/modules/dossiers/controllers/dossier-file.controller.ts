import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { PaginationFileDto } from '@/modules/files/objects/dto/pagination-file.dto'
import { PaginatedFileDto } from '@/modules/files/objects/dto/paginated-file.dto'
import { FileService } from '@/modules/files/providers/file.service'
import {
  Roles,
  eFileSourceLabel,
} from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { CurrentDossierInterceptor } from '@/modules/dossiers/providers/current-dossier.interceptor'
import { CurrentDossier } from '@/modules/dossiers/providers/current-dossier.decorator'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { In, Not } from 'typeorm'

import { hasFullCurrentDossierAcces } from '../providers/has-full-current-dossier-access.decorator'

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
    @hasFullCurrentDossierAcces() canSeeAllFiles: boolean,
    @CurrentDossier() dossier: Dossier,
  ): Promise<PaginatedFileDto> {
    this.logger.verbose('listDossierFiles')
    const specificWhere = canSeeAllFiles
      ? {}
      : {
        sourceLabel: Not(In([
          eFileSourceLabel['ds-annotation'],
          eFileSourceLabel['ds-message'],
        ])),
      }
    return this.fileService.paginate(dto, specificWhere, [
      `("o"."dossierId" = ${dossier.id})`,
    ])
  }

  @Get('summary')
  @Role(Roles.instructor)
  async getOrganismeFileSummary(
    @CurrentDossier() dossier: Dossier,
    @hasFullCurrentDossierAcces() hasFullAccess: boolean,
  ): Promise<number> {
    this.logger.verbose('getDossierFileSummary')

    return this.fileService.getDossierFileSummary(dossier.id, hasFullAccess)
  }
}
