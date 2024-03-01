import {
  Controller,
  ForbiddenException,
  Get,
  Param,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DossierService } from '../providers/dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { canAccessDemarche, canAccessPrefectureInDemarche, IRole, Roles } from '@biblio-num/shared'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'
import { LoggerService } from '../../../shared/modules/logger/logger.service'

@ApiTags('Dossiers')
@Controller('dossiers')
export class DossierController {
  constructor (
    private readonly dossiersService: DossierService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get(':id')
  @Role(Roles.instructor)
  async findOne (@CurrentUserRole() role: IRole, @Param('id') id: string): Promise<Dossier> {
    this.logger.verbose('findone')
    const dossier = await this.dossiersService.findOneOrThrow({
      where: { id: Number(id) },
      relations: ['demarche', 'organisme', 'files'],
    })
    if (!canAccessDemarche(dossier.demarche.id, role)) {
      throw new ForbiddenException('Vous n’avez pas accès à la démarche correspondante à ce dossier')
    }
    const fullDossier = canAccessPrefectureInDemarche(dossier.prefecture, role, dossier.demarche.id)
    if (!fullDossier) {
      dossier.dsDataJson.annotations = []
      dossier.dsDataJson.messages = []
    }
    const dossierWithFiles = this.dossiersService.transformValueFileOfDossier(dossier, dossier.files)
    return {
      ...dossierWithFiles,
      dsDataJson: {
        ...dossierWithFiles.dsDataJson,
        annotations: fullDossier ? dossierWithFiles.dsDataJson.annotations : [],
        messages: fullDossier ? dossierWithFiles.dsDataJson.messages : [],
      },
    }
  }
}
