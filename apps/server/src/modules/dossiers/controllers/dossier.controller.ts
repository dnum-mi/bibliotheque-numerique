import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DossierService } from '../providers/dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'

@ApiTags('Dossiers')
@Controller('dossiers')
export class DossierController {
  constructor (private readonly dossiersService: DossierService) {}

  @Get(':id')
  async findOne (@Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneById(+id)
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    return dossier
  }

  @Get(':id/detail')
  async findOneWithDetail (@Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneById(+id, { demarche: true })
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    return dossier
  }
}
