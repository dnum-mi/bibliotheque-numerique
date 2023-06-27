import * as dotenv from "dotenv";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { LoggerService } from "./modules/logger/logger.service";
import { configMain } from "./config-main";

dotenv.config();

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  if (process.env.NODE_ENV !== "production") {
    const { SwaggerModule, DocumentBuilder } = await import("@nestjs/swagger");

    const config = new DocumentBuilder()
      .setTitle("Bibliothèque numérique API ")
      .setDescription("Bibliothèque numérique API documentation")
      .setVersion("1.0")
      .setBasePath("/api")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger", app, document);
  }
  const configService = app.get(ConfigService);
  configMain(app, configService);
  app.useLogger(app.get(LoggerService));
  await app.listen(configService.get("port"));
}
bootstrap();
