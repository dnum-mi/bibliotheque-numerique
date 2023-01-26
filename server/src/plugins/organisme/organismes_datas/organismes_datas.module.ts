import { Module } from "@nestjs/common";
import { OrganismesDatasService } from "./organismes_datas.service";
import { OrganismesDatasController } from "./organismes_datas.controller";
import { ConnectorModule } from "plugins/connector/connector.module";
import { OrganismesSource } from "../entities";

@Module({
  imports: [ConnectorModule.register(OrganismesSource)],
  controllers: [OrganismesDatasController],
  providers: [OrganismesDatasService],
})
export class OrganismesDatasModule {}
