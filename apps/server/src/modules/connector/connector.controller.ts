import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ConnectorService } from './connector.service'
import { Roles, RolesGuard } from '../roles/providers/roles.guard'
import { Connector } from './connector.entity'

@ApiTags('Connector')
@Controller('connector')
@UseGuards(RolesGuard)
@Roles('admin')
export class ConnectorController {
  constructor (private readonly connectorService: ConnectorService) {}

  @Get()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findAll () {
    return this.connectorService.findAll()
  }

  @Post()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  create (
    @Body()
      connector: Partial<Connector>,
  ) {
    return this.connectorService.upsert(connector)
  }

  @Delete(':id')
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  remove (@Param('id', ParseIntPipe) id: number) {
    return this.connectorService.remove(id)
  }
}
