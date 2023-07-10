import * as passport from "passport";
import * as session from "express-session";
import { sessionSecret } from "./modules/auth/objects/constants";
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "./shared/modules/logger/logger.service";
import { HttpAdapterHost } from "@nestjs/core";
import { QueryFailedFilter } from "./shared/exceptions/filters/query-failed.filter";
import { AllExceptionsFilter } from "./shared/exceptions/filters/all-exception.filter";

export const configMain = (
  app: INestApplication,
  configService?: ConfigService,
): void => {
  app.useLogger(app.get(LoggerService));
  const loggerService = app.get(LoggerService);
  loggerService.setContext("Nestjs-bootstrap");
  const httpAdapterHost = app.get(HttpAdapterHost);
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
  // order is important here, from most generic to most specific
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, loggerService),
    new QueryFailedFilter(httpAdapterHost, loggerService),
  );
  app.use(passport.initialize());
  app.use(passport.session());
};
