import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { LoggerService } from "../../src/shared/modules/logger/logger.service";
import { loggerServiceMock } from "../mock/logger-service.mock";
import { configMain } from "../../src/config-main";
import { INestApplication } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { mailerServiceMock } from "../mock/mailer-service.mock";
import { SendMailModule } from "../../src/modules/sendmail/sendmail.module";

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

export class CTestingModuleFactory {
  app: INestApplication;
  mailerService = mailerServiceMock;

  async init(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(MailerService)
      .useValue(this.mailerService)
      .compile();

    this.app = moduleFixture.createNestApplication();
    configMain(this.app);
    await this.app.init();
  }
}
