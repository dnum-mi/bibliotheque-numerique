import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../src/app.module";
import { configMain } from "../../../src/config-main";
import { INestApplication } from "@nestjs/common";
import { DsApiClient } from "@dnum-mi/ds-api-client";
import { dsApiClientMock } from "../../mock/ds-api-client/ds-api-client.mock";
import { LoggerService } from "../../../src/shared/modules/logger/logger.service";
import { loggerServiceMock } from "../../mock/logger-service.mock";

export const TestingModuleFactory = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LoggerService)
    .useValue(loggerServiceMock)
    .overrideProvider(DsApiClient)
    .useValue(dsApiClientMock)
    .compile();
  const app = moduleFixture.createNestApplication();
  await configMain(app);
  await app.init();
  return app;
};
