import { Global, Module } from "@nestjs/common";
import { LoggerService } from "@/modules/logger/logger.service";

@Global()
@Module({
  imports: [],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
