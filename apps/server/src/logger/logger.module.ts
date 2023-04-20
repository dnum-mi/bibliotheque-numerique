import { Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { ConfigModule } from "@nestjs/config";
import configuration from "../config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
