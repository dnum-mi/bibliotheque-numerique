import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { LoggerService } from "./modules/logger/logger.service";
import * as session from "express-session";
import * as passport from "passport";
import { sessionSecret } from "./modules/auth/constants";

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const config = new DocumentBuilder()
    .setTitle("Bibliothèque numérique API ")
    .setDescription("Bibliothèque numérique API documentation")
    .setVersion("1.0")
    .setBasePath("/api")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  const configService = app.get(ConfigService);
  app.use(
    session({
      secret: sessionSecret.secret,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: configService.get<number>("cookie.maxAge") },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useLogger(app.get(LoggerService));
  await app.listen(configService.get("port"));
}
bootstrap();
