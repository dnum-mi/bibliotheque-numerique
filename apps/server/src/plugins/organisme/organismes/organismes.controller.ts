import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
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

  @Get('rna/:id')
  findOneByIdRna (@Param('id') id: string): Promise<Organisme> {
    return this.organismesService.findOneByIdRef(id)
  }
}
