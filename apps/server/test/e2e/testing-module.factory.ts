import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { LoggerService } from "../../src/shared/modules/logger/logger.service";
import { loggerServiceMock } from "../mock/logger-service.mock";
import { configMain } from "../../src/config-main";
import { INestApplication } from "@nestjs/common";

export const TestingModuleFactory = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LoggerService)
    .useValue(loggerServiceMock)
    .compile();
  const app = moduleFixture.createNestApplication();
  configMain(app);
  await app.init();
  return app;
};
