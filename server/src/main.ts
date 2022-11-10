import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import { LoggerService } from "./logger/logger.service";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.useLogger(app.get(LoggerService));
  const configService = app.get(ConfigService);
  await app.listen(configService.get("PORT"));
}
bootstrap();
