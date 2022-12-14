import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import { LoggerService } from "./logger/logger.service";
import * as session from "express-session";
import * as passport from "passport";
import { sessionSecret } from "auth/constants";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.use(
    session({
      secret: sessionSecret.secret,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useLogger(app.get(LoggerService));
  const configService = app.get(ConfigService);
  await app.listen(configService.get("port"));
}
bootstrap();
