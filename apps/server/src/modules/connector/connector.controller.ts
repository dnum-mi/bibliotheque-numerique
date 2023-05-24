import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Body,
  Post,
  ParseIntPipe,
} from "@nestjs/common";
import { ConnectorService } from "./connector.service";
import { Roles, RolesGuard } from "../roles/providers/roles.guard";
import { Connector } from "../../shared/entities";

@Controller("connector")
@UseGuards(RolesGuard)
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}

  @Roles("admin")
  @Get()
  findAll() {
    return this.connectorService.findAll();
  }

  @Roles("admin")
  @Get(":id")
  findOneById(@Param("id", ParseIntPipe) id: number) {
    return this.connectorService.findOneById(id);
  }

  @Roles("admin")
  @Get("name/:name")
  findOneBySourceName(@Param("name") name: string) {
    return this.connectorService.findOneBySourceName(name);
  }

  @Roles("admin")
  @Post()
  create(
    @Body()
    connector: Partial<Connector>,
  ) {
    return this.connectorService.upsert(connector);
  }

  @Roles("admin")
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.connectorService.remove(id);
  }
}
