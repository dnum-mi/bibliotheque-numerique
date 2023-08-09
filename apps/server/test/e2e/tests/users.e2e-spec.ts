import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TestingModuleFactory } from "../common/testing-module.factory";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../../../src/modules/auth/objects/constants";
import { getAdminCookie } from "../common/get-admin-cookie";
import { getUserCookie } from "../common/get-user-cookie";
import { faker } from "@faker-js/faker/locale/fr";

describe("users (e2e)", () => {
  let app: INestApplication;
  let mailerService: MailerService;
  let cookie: string;

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory();
    await testingModule.init();
    app = testingModule.app;
    mailerService = testingModule.mailerService as MailerService;
  });

  beforeEach(() => {
    jest.spyOn(mailerService, "sendMail").mockClear();
  });
  afterAll(async () => {
    await app.close();
  });

  it("GET /users - Should return error 403 if user is not connected", async () => {
    await request(app.getHttpServer()) //
      .get(`/users`)
      .expect(403);
  });

  it("GET /users - Should return error 403 if user is not admin", async () => {
    cookie = await getUserCookie(app);
    await request(app.getHttpServer()) //
      .get(`/users`)
      .set("Cookie", [cookie])
      .expect(403);
  });

  it("GET /users - Should return all users", async () => {
    cookie = await getAdminCookie(app);
    const response = await request(app.getHttpServer())
      .get(`/users`)
      .set("Cookie", [cookie])
      .expect(200);
    expect(response.body).toBeDefined();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].id).toBeDefined();
    expect(response.body[0].email).toBeDefined();
    expect(response.body[0].password).toBeUndefined();
  });

  it("GET /users/:id - Should return the user", async () => {
    const id = 2;
    cookie = await getAdminCookie(app);
    const response = await request(app.getHttpServer())
      .get(`/users/${id}`)
      .set("Cookie", [cookie])
      .expect(200);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(id);
    expect(response.body.email).toBeDefined();
    expect(response.body.password).toBeUndefined();
  });

  it("GET /users/:id - Should return error 404 if the user is not found", async () => {
    const id = 999;
    cookie = await getAdminCookie(app);
    await request(app.getHttpServer()) //
      .get(`/users/${id}`)
      .set("Cookie", [cookie])
      .expect(404);
  });

  it("GET /users/:id - Should return error 400 if user id is not a number", async () => {
    const id = "test";
    cookie = await getAdminCookie(app);
    await request(app.getHttpServer()) //
      .get(`/users/${id}`)
      .set("Cookie", [cookie])
      .expect(400);
  });

  it("GET /users/:id - Should return error 403 if user is not connected", async () => {
    const id = 2;
    await request(app.getHttpServer()) //
      .get(`/users/${id}`)
      .expect(403);
  });

  it("POST /users/reset-password - Should send a mail to reset password with e-mail correct", async () => {
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
    await request(app.getHttpServer()) //
      .post("/users/reset-password")
      .send({
        email,
      });
    expect(mailerService.sendMail).toBeCalled();
    expect(to).toBe(email);
    expect(subject).toBe("Modifier son mot de passe");
  });

  it("POST /users/reset-password - Should no send mail for reset password with e-mail no correct", async () => {
    await request(app.getHttpServer()) //
      .post("/users/reset-password")
      .send({
        email: "nouser@test.com",
      });
    expect(mailerService.sendMail).not.toBeCalled();
  });

  it("PUT /users/user - should 401 to update password if there are not token", async () => {
    await request(app.getHttpServer()) //
      .put("/users/user")
      .send({})
      .expect(401);
  });

  it("PUT /users/user - should 403 to update password with invalide token", async () => {
    await request(app.getHttpServer()) //
      .put("/users/user")
      .send({ token: "test" })
      .expect(403);
  });

  it("PUT /users/user - should 200 to update password ", async () => {
    const jwtService = new JwtService({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "1m" },
    });
    const jwt = jwtService.sign({ user: 2 });
    const jwtforurl = Buffer.from(jwt).toString("base64url");

    await request(app.getHttpServer()) //
      .put("/users/user")
      .send({
        password: "Y,cqu;CQ.5]BcD3",
        token: jwtforurl,
      })
      .expect(200);
  });

  it("PUT /users/user - should 400 to update password without password", async () => {
    const jwtService = new JwtService({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "1m" },
    });
    const jwt = jwtService.sign({ user: 2 });
    const jwtforurl = Buffer.from(jwt).toString("base64url");

    await request(app.getHttpServer()) //
      .put("/users/user")
      .send({
        token: jwtforurl,
      })
      .expect(400);
  });

  it("POST /users/user - Should return error 400 if email is not valid", async () => {
    const email = "test";
    const password = "ThisIs1ValidPassword#";
    await request(app.getHttpServer())
      .post("/users/user")
      .send({
        email,
        password,
      })
      .expect(400);
  });

  it("POST /users/user - Should return error 400 if password is not valid", async () => {
    const email = "test2@bn.fr";
    const password = "test";
    await request(app.getHttpServer())
      .post("/users/user")
      .send({
        email,
        password,
      })
      .expect(400);
  });

  it("POST /users/user - Should create a user", async () => {
    const email = faker.internet.email();
    const password = "ThisIs1ValidPassword#";
    const response = await request(app.getHttpServer())
      .post("/users/user")
      .send({
        email,
        password,
      })
      .expect(201);
    expect(response.body).toBeDefined();
    expect(response.body.email).toBe(email);
    expect(response.body.id).toBeDefined();
  });

  it("POST /users/user - Should return error 409 if user already exists", async () => {
    const email = "admin@localhost.com";
    const password = "ThisIs1ValidPassword#";
    await request(app.getHttpServer())
      .post("/users/user")
      .send({
        email,
        password,
      })
      .expect(409);
  });
});
