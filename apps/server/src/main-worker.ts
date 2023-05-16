import * as dotenv from "dotenv";

dotenv.config();

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "./logger/logger.service";
import { AppWorkerModule } from "./app-worker.module";

async function bootstrap() {
  const app = await NestFactory.create(AppWorkerModule, {
    cors: true,
  });
  const configService = app.get(ConfigService);
  app.useLogger(app.get(LoggerService));
  await app.listen(configService.get("port"));
}

bootstrap();
