import { Controller, Get, Param, Delete, UseGuards, Body, Post, ParseIntPipe } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ConnectorService } from './connector.service'
import { Roles, RolesGuard } from '../roles/providers/roles.guard'
import { Connector } from './connector.entity'

@ApiTags('Connector')
@Controller('connector')
@UseGuards(RolesGuard)
export class ConnectorController {
  constructor (private readonly connectorService: ConnectorService) {}

  @Roles('admin')
  @Get()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findAll () {
    return this.connectorService.findAll()
  }

  @Roles('admin')
  @Get(':id')
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findOneById (@Param('id', ParseIntPipe) id: number) {
    return this.connectorService.findOneById(id)
  }

  @Roles('admin')
  @Get('name/:name')
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findOneBySourceName (@Param('name') name: string) {
    return this.connectorService.findOneBySourceName(name)
  }

  @Roles('admin')
  @Post()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  create (
    @Body()
      connector: Partial<Connector>,
  ) {
    return this.connectorService.upsert(connector)
  }

  @Roles('admin')
  @Delete(':id')
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  remove (@Param('id', ParseIntPipe) id: number) {
    return this.connectorService.remove(id)
  }
}
