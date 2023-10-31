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

@ApiTags('Dossiers')
@Controller('dossiers')
export class DossierController {
  constructor (
    private readonly dossiersService: DossierService,
  ) {}

  @Get(':id')
  @Role(Roles.instructor)
  async findOne (@CurrentUserRole() role: IRole, @Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneOrThrow({
      where: { id: Number(id) },
      relations: ['demarche'],
    })
    if (!canAccessDemarche(dossier.demarche.id, role)) {
      throw new ForbiddenException('Vous n’avez pas accès à la démarche correspondante à ce dossier')
    }
    const fullDossier = canAccessPrefectureInDemarche(dossier.prefecture, role, dossier.demarche.id)
    return {
      ...dossier,
      dsDataJson: {
        ...dossier.dsDataJson,
        annotations: fullDossier ? dossier.dsDataJson.annotations : [],
        messages: fullDossier ? dossier.dsDataJson.messages : [],
      },
    }
  }
}
