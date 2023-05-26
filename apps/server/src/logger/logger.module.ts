import { MiddlewareConsumer, Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "../config/configuration";
import { MorganMiddleware } from "@nest-middlewares/morgan";
import { jsonFormat } from "./morgan-jsonformat.function";

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
export class LoggerModule {
  constructor(
    private config: ConfigService,
    private loggerService: LoggerService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    this.config.get("isDev")
      ? MorganMiddleware.configure("tiny", {
          stream: {
            write: (message) => this.loggerService.log(message),
          },
        })
      : MorganMiddleware.configure(jsonFormat);
    consumer.apply(MorganMiddleware).forRoutes("*");
  }
}
