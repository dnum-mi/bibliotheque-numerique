import { Module } from "@nestjs/common";
import { OrganismesDatasService } from "./organismes_datas.service";
import { OrganismesDatasController } from "./organismes_datas.controller";
import { ConnectorModule } from "../../../connector/connector.module";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

@Module({
  imports: [ConnectorModule, ParseToOrganismesModule],
  controllers: [OrganismesDatasController],
  providers: [OrganismesDatasService],
})
export class OrganismesDatasModule {}
