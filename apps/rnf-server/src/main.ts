import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AllExceptionsFilter } from "@/shared/filters/all-exception.filter";
import { LoggerService } from "@/modules/logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useLogger(app.get(LoggerService));
  app.setGlobalPrefix("/api");
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, loggerService));

  await app.listen(configService.get("port") ?? 3001);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
