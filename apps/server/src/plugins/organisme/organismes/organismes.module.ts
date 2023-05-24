import { Module } from "@nestjs/common";

import { ConnectorModule } from "../../../modules/connector/connector.module";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

import { OrganismesController } from "./organismes.controller";

import { OrganismesService } from "./organismes.service";
import { OrganismesDatasService } from "../organismes_datas/organismes_datas.service";

@Module({
  imports: [ConnectorModule, ParseToOrganismesModule],
  controllers: [OrganismesController],
  providers: [OrganismesService, OrganismesDatasService],
})
export class OrganismesModule {}
