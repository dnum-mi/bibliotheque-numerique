import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DossierService } from '../providers/dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'

@ApiTags('Dossiers')
@Controller('dossiers')
export class DossierController {
  constructor (private readonly dossiersService: DossierService) {}

  @Get()
  async findAll (): Promise<Dossier[]> {
    const dossiers = await this.dossiersService.findAll()
    if (dossiers.length === 0) {
      throw new NotFoundException('No dossier found')
    }
    return dossiers
  }

  @Get(':id')
  async findOne (@Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOne(+id)
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    return dossier
  }

  @Get(':id/detail')
  async findOneWithDetail (@Param('id') id: string): Promise<Dossier> {
    const dossier = await this.dossiersService.findOneWithDetail(+id)
    if (!dossier) {
      throw new NotFoundException(`Dossier id: ${id} not found`)
    }
    return dossier
  }
}
