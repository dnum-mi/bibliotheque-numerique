import * as dotenv from "dotenv";

dotenv.config();

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "./modules/logger/logger.service";
import { AppWorkerModule } from "./app-worker.module";

async function bootstrap() {
  const app = await NestFactory.create(AppWorkerModule);
  const configService = app.get(ConfigService);
  app.useLogger(app.get(LoggerService));
  await app.listen(configService.get("port"));
}

bootstrap();
