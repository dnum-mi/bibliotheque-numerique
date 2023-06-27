import * as dotenv from "dotenv";

dotenv.config();
import * as passport from "passport";
import * as session from "express-session";
import { sessionSecret } from "./modules/auth/objects/constants";
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const configMain = (
  app: INestApplication,
  configService?: ConfigService,
): void => {
  app.use(
    session({
      secret: sessionSecret.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: configService
          ? configService.get<number>("cookie.maxAge")
          : 3600000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
};
