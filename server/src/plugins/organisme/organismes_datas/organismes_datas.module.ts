import { Module } from "@nestjs/common";
import { OrganismesDatasService } from "./organismes_datas.service";
import { OrganismesDatasController } from "./organismes_datas.controller";
import { ConnectorModule } from "../../../connector/connector.module";
import { Parse2OrganismesModule } from "../parserByConnector/parse2organismes.module";

@Module({
  imports: [ConnectorModule, Parse2OrganismesModule],
  controllers: [OrganismesDatasController],
  providers: [OrganismesDatasService],
})
export class OrganismesDatasModule {}
