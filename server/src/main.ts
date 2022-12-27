import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { LoggerService } from "./logger/logger.service";
import * as session from "express-session";
import * as passport from "passport";
import { sessionSecret } from "auth/constants";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
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
