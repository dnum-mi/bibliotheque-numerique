import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TestingModuleFactory } from "../testing-module.factory";

describe("⚠️ TODO: Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestingModuleFactory();
  });

  afterAll(async () => {
    await app.close();
  });

  it("shoud return 403 on bad sign_in", () => {
    return (
      request(app.getHttpServer())
        // @ts-ignore The property 'post' really exists
        .post("/auth/sign-in")
        .send({
          email: "toto",
          password: "toto",
        })
        .expect(404)
    );
  });

  it("shoud return 200 on connection", async () => {
    await request(app.getHttpServer())
      // @ts-ignore The property 'post' really exists
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
