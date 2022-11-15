import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

import * as dotenv from "dotenv";
import { LoggerService } from "./logger/logger.service";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.useLogger(app.get(LoggerService));
  await app.listen(3000);
}
bootstrap();
