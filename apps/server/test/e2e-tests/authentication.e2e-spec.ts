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

  it("shoud return 403 on bad sign_in", async () => {
    return request(app.getHttpServer())
      .post("/auth/sign_in")
      .send({
        email: "toto",
        password: "toto",
      })
      .expect(404)
      .expect({
        statusCode: 404,
        message: "Cannot POST /auth/sign_in",
        error: "Not Found",
      });
  });
});
