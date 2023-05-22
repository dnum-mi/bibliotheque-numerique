import { Module } from "@nestjs/common";
import { DossiersService } from "./dossiers.service";
import { DossiersController } from "./dossiers.controller";

@Module({
  controllers: [DossiersController],
  providers: [DossiersService],
  exports: [DossiersService],
})
export class DossiersModule {}
