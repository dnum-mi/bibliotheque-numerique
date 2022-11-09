import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DemarcheDS } from "../entities";
import { DemarchesDSService } from "./demarches_ds.service";

@Module({
  imports: [TypeOrmModule.forFeature([DemarcheDS])],
  controllers: [],
  providers: [DemarchesDSService],
  exports: [DemarchesDSService],
})
export class DemarchesDSModule {}
