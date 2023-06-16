import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HttpModule } from "@nestjs/axios";
import { HealthController } from "./controllers/health.controller";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";

@Module({
  imports: [
    TerminusModule.forRoot({
      logger: LoggerService,
    }),
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
