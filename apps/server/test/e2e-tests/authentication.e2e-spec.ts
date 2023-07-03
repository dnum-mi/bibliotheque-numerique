import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../src/app.module";
import { configMain } from "../../src/config-main";
import * as request from "supertest";
import { loggerServiceMock } from "../mock/logger-service.mock";

describe("⚠️ TODO: Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    configMain(app);
    app.useLogger(loggerServiceMock);
    await app.init();
  });

  it("shoud return 403 on bad sign_in", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "toto",
        password: "toto",
      })
      .expect(500); // TODO: should be 403
  });

  it("shoud return 200 on connection", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "admin@localhost.com",
        password: "password",
      })
      .expect(201) // TODO: should be 200
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: 1,
          email: "admin@localhost.com",
        });
        expect(body.roles?.[0]).toMatchObject({
          id: 1,
          name: "admin",
          description: "App administrator, has full rights",
          permissions: [],
        });
      });
  });
});
