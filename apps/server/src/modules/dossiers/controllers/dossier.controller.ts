import {
  Controller, ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DossierService } from '../providers/dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'
import { DemarcheService } from '../../demarches/providers/services/demarche.service'
import { AuthenticatedGuard } from '../../auth/providers/authenticated.guard'

@ApiTags('Dossiers')
@Controller('dossiers')
export class DossierController {
  constructor (
    private readonly dossiersService: DossierService,
    private readonly demarcheService: DemarcheService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  async findOne (@Request() req, @Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneById(+id, { demarche: true })
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    if (this.demarcheService.withPermissions(req.user, dossier.demarche)) {
      return dossier
    } else {
      throw new ForbiddenException(`Not authorized access for dossier id: ${id}`)
    }
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id/detail')
  async findOneWithDetail (@Request() req, @Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneById(+id, { demarche: true })
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    if (this.demarcheService.withPermissions(req.user, dossier.demarche)) {
      return dossier
    } else {
      throw new ForbiddenException(`Not authorized access for dossier id: ${id}`)
    }
  }
}
