import { Module } from "@nestjs/common";
import { OrganismesDatasService } from "./organismes_datas.service";
import { ConnectorModule } from "../../../modules/connector/connector.module";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

@Module({
  imports: [ConnectorModule, ParseToOrganismesModule],
  providers: [OrganismesDatasService],
})
export class OrganismesDatasModule {}
