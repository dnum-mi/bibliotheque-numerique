import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { mainConfig } from "@/main.config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  mainConfig(app);
  const config = new DocumentBuilder()
    .setTitle("RNF API")
    .setDescription("RNF API documentation")
    .setVersion("0.1")
    .setBasePath("/api")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);
  await app.listen(configService.get("port") ?? 3001);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
