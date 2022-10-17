import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DossierEntity } from "../entities";

@Module({
  imports: [TypeOrmModule.forFeature([DossierEntity])],
  controllers: [],
  providers: [],
})
export class DossiersModule {}
