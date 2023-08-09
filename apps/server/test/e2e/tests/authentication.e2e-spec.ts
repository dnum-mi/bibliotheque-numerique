import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { dataSource } from "../data-source-e2e.typeorm";
import { TestingModuleFactory } from "../common/testing-module.factory";

describe("⚠️ TODO: Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory();
    await testingModule.init();
    app = testingModule.app;
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  it("shoud return 403 on bad sign_in", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "toto",
        password: "toto",
      })
      .expect(404);
  });

  it("shoud return 200 on connection", async () => {
    await request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "admin@localhost.com",
        password: "password",
      })
      .expect(200)
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
