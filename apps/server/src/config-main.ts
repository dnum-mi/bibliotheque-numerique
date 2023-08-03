import * as passport from "passport";
import * as session from "express-session";
import { sessionSecret } from "./modules/auth/objects/constants";
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "./shared/modules/logger/logger.service";
import { HttpAdapterHost } from "@nestjs/core";
import { QueryFailedFilter } from "./shared/exceptions/filters/query-failed.filter";
import { AllExceptionsFilter } from "./shared/exceptions/filters/all-exception.filter";

export const configMain = async (
  app: INestApplication,
  configService?: ConfigService,
): Promise<void> => {
  const loggerService = await app.resolve<LoggerService>(LoggerService);
  configService = configService ?? app.get(ConfigService);
  loggerService.setContext("Nestjs-main");
  app.useLogger(loggerService);
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
  let exceptionFilterLogger: LoggerService = loggerService;
  let queryFailedFilterLogger: LoggerService = loggerService;
  if (!configService.get("isTest")) {
    exceptionFilterLogger = new LoggerService(configService);
    exceptionFilterLogger.setContext("AllExceptionsFilter");
    queryFailedFilterLogger = new LoggerService(configService);
    queryFailedFilterLogger.setContext("QueryFailedFilter");
  }
  // order is important here, from most generic to most specific
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, exceptionFilterLogger),
    new QueryFailedFilter(httpAdapterHost, queryFailedFilterLogger),
  );
  app.use(passport.initialize());
  app.use(passport.session());
};
