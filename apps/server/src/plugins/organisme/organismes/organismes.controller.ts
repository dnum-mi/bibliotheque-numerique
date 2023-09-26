import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { LeanDossierOutputDto } from '@biblio-num/shared'

import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { OrganismesService } from './organismes.service'
import { Organisme } from './organisme.entity'

@ApiTags('Organismes')
@Controller('organismes')
export class OrganismesController {
  constructor (
    private readonly organismesService: OrganismesService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  async findAll (): Promise<Organisme[]> {
    return this.organismesService.findAll()
  }

  @Get(':id/dossiers')
  async findOrganismeDossiers (): Promise<LeanDossierOutputDto[]> {
    return [
      {
        id: 1,
        demarcheTitle: 'Demande de subvention',
        prefecture: '25',
        state: 'en_instruction',
        depotDate: '25/09/2023',
      },
      {
        id: 2,
        demarcheTitle: 'Demande de subvention',
        prefecture: '41',
        state: 'accepted',
        depotDate: '25/09/2023',
      },
      {
        id: 3,
        demarcheTitle: 'Demande de subvention',
        prefecture: '56',
        state: 'accepted',
        depotDate: '25/09/2023',
      },
      {
        id: 3,
        demarcheTitle: 'Demande de subvention',
        prefecture: '40',
        state: 'en_instruction',
        depotDate: '25/09/2023',
      },
      {
        id: 345,
        demarcheTitle: 'Demande de subvention',
        prefecture: '65',
        state: 'accepted',
        depotDate: '25/09/2023',
      },
      {
        id: 376,
        demarcheTitle: 'Demande de subvention',
        prefecture: '54',
        state: 'accepted',
        depotDate: '25/09/2023',
      },
      {
        id: 398,
        demarcheTitle: 'Demande de subvention',
        prefecture: '97',
        state: 'accepted',
        depotDate: '25/09/2023',
      },
      {
        id: 32,
        demarcheTitle: 'Demande de subvention',
        prefecture: '82',
        state: 'en_instruction',
        depotDate: '25/09/2023',
      },
      {
        id: 36,
        demarcheTitle: 'Demande de subvention',
        prefecture: '93',
        state: 'en_instruction',
        depotDate: '25/09/2023',
      },
      {
        id: 39,
        demarcheTitle: 'Demande de subvention',
        prefecture: '20',
        state: 'accepted',
        depotDate: '25/09/2023',
      },
    ]
  }

  @Get('rna/:id')
  findOneByIdRna (@Param('id') id: string): Promise<Organisme> {
    return this.organismesService.findOneByIdRef(id)
  }
}
