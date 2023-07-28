import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { CTestingModuleFactory } from "../common/testing-module.factory";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";

describe("users (e2e)", () => {
  let app: INestApplication;
  let mailerService: MailerService;

  beforeAll(async () => {
    const testingModule = new CTestingModuleFactory();
    await testingModule.init();
    app = testingModule.app;
    mailerService = testingModule.mailerService as unknown as MailerService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(async () => {
    await app.close();
  });

  it("Should send a mail to reset password with e-mail correct", async () => {
    const email = "admin@localhost.com";
    let to: string;
    let subject: string;
    jest
      .spyOn(mailerService, "sendMail")
      .mockImplementation(
        (sendMailOptions: ISendMailOptions): Promise<void> => {
          expect(sendMailOptions).toBeDefined();
          to = sendMailOptions.to as string;
          subject = sendMailOptions.subject;
          return;
        },
      );
    await request(app.getHttpServer())
      // @ts-ignore The property 'post' really exists
      .post("/users/reset-password")
      .send({
        email,
      });
    expect(mailerService.sendMail).toBeCalled();
    expect(to).toBe(email);
    expect(subject).toBe("Modifier son mot de passe");
  });

  it("Should no send mail for reset password with e-mail no correct", async () => {
    await request(app.getHttpServer())
      // @ts-ignore The property 'post' really exists
      .post("/users/reset-password")
      .send({
        email: "nouser@test.com",
      });
    expect(mailerService.sendMail).not.toBeCalled();
  });
});
