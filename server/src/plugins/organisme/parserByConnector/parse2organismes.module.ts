import { Module } from "@nestjs/common";
import { Parse2OrganismesService } from "./parse2organismes.service";

@Module({
  providers: [Parse2OrganismesService],
  exports: [Parse2OrganismesService],
})
export class Parse2OrganismesModule {}
