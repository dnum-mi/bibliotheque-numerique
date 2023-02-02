import { Module } from "@nestjs/common";
import { OrganismesDatasService } from "./organismes_datas.service";
import { OrganismesDatasController } from "./organismes_datas.controller";
import { ConnectorModule } from "../../../connector/connector.module";

@Module({
  imports: [ConnectorModule],
  controllers: [OrganismesDatasController],
  providers: [OrganismesDatasService],
})
export class OrganismesDatasModule {}
