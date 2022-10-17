import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DossierDSEntity } from "../entities";

@Module({
  imports: [TypeOrmModule.forFeature([DossierDSEntity])],
  controllers: [],
  providers: [],
})
export class DossiersDSModule {}
