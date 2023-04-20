import { Module } from "@nestjs/common";
import { ParseToOrganismesService } from "./parse_to_organismes.service";

@Module({
  providers: [ParseToOrganismesService],
  exports: [ParseToOrganismesService],
})
export class ParseToOrganismesModule {}
