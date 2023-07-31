import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { CTestingModuleFactory } from "../common/testing-module.factory";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../../../src/modules/auth/objects/constants";

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

  it("should 401 to update password if there are not token", async () => {
    await request(app.getHttpServer())
      // @ts-ignore The property 'post' really exists
      .put("/users/user")
      .send({})
      .expect(401);
  });

  it("should 403 to update password with invalide token", async () => {
    await request(app.getHttpServer())
      // @ts-ignore The property 'post' really exists
      .put("/users/user")
      .send({ token: "test" })
      .expect(403);
  });

  it("should 200 to update password ", async () => {
    const jwtService = new JwtService({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "1m" },
    });
    const jwt = jwtService.sign({ user: 2 });
    const jwtforurl = Buffer.from(jwt).toString("base64url");

    await request(app.getHttpServer())
      // @ts-ignore The property 'post' really exists
      .put("/users/user")
      .send({
        password: "Y,cqu;CQ.5]BcD3",
        token: jwtforurl,
      })
      .expect(200);
  });

  it("should 400 to update password without password", async () => {
    const jwtService = new JwtService({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "1m" },
    });
    const jwt = jwtService.sign({ user: 2 });
    const jwtforurl = Buffer.from(jwt).toString("base64url");

    await request(app.getHttpServer())
      // @ts-ignore The property 'post' really exists
      .put("/users/user")
      .send({
        token: jwtforurl,
      })
      .expect(400);
  });
});
