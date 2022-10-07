import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DemarcheModule } from "./demarche/demarche.module";

@Module({
  imports: [DemarcheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
