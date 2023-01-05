import { Module } from "@nestjs/common";
import { OrganismesDatasService } from "./organismes_datas.service";
import { OrganismesDatasController } from "./organismes_datas.controller";

@Module({
  controllers: [OrganismesDatasController],
  providers: [OrganismesDatasService],
})
export class OrganismesDatasModule {}
