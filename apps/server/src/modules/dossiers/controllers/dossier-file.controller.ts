import {
  Body,
  Controller,
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
  canAccessPrefectureInDemarche,
  IRole,
  eFileSourceLabel,
} from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { CurrentDossierInterceptor } from '@/modules/dossiers/providers/current-dossier.interceptor'
import { CurrentDossier } from '@/modules/dossiers/providers/current-dossier.decorator'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'
import { In, Not } from 'typeorm'

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
    @CurrentUserRole() role: IRole,
    @CurrentDossier() dossier: Dossier,
  ): Promise<PaginatedFileDto> {
    this.logger.verbose('listDossierFiles')
    const canSeeAllFiles = canAccessPrefectureInDemarche(
      dossier.prefecture,
      role,
      dossier.demarcheId,
    )
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
}
