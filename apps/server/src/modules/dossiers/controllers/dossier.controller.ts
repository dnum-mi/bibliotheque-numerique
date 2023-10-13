import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Request,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DossierService } from '../providers/dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { Roles } from '@biblio-num/shared'

@ApiTags('Dossiers')
@Controller('dossiers')
export class DossierController {
  constructor (
    private readonly dossiersService: DossierService,
  ) {}

  @Get(':id')
  @Role(Roles.superadmin) // TODO: role - filter with options
  async findOne (@Request() req, @Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneById(+id, { demarche: true })
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    return dossier
    // eslint-disable-next-line
    // @ts-ignore TODO: role refacto
    // if (this.demarcheService.withPermissions(req.user, dossier.demarche)) {
    //   return dossier
    // } else {
    //   throw new ForbiddenException(`Not authorized access for dossier id: ${id}`)
    // }
  }

  @Get(':id/detail')
  @Role(Roles.instructor) // TODO: role - filter with options
  async findOneWithDetail (@Request() req, @Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneById(+id, { demarche: true })
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    return dossier
    // eslint-disable-next-line
    // @ts-ignore TODO: role refacto
    // if (this.demarcheService.withPermissions(req.user, dossier.demarche)) {
    //   return dossier
    // } else {
    //   throw new ForbiddenException(`Not authorized access for dossier id: ${id}`)
    // }
  }
}
