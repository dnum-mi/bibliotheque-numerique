import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DemarcheDSEntity } from "../entities";
import { DemarchesDSService } from "./demarches_ds.service";

@Module({
  imports: [TypeOrmModule.forFeature([DemarcheDSEntity])],
  controllers: [],
  providers: [DemarchesDSService],
  exports: [DemarchesDSService],
})
export class DemarchesDSModule {}
