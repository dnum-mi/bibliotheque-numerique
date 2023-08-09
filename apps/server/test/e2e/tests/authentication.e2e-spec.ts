import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getAdminCookie } from "../common/get-admin-cookie";
import { dataSource } from "../data-source-e2e.typeorm";
import { TestingModuleFactory } from "../common/testing-module.factory";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let cookie: string;

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory();
    await testingModule.init();
    app = testingModule.app;
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  it("POST /auth/sign-in - Should return 404 on bad sign_in", () => {
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "toto",
        password: "toto",
      })
      .expect(404);
  });

  it("POST /auth/sign-in - Should return 404 on bad password", async () => {
    await request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: "admin@localhost.com",
        password: "badpassword",
      })
      .expect(404);
  });

  it("POST /auth/sign-in - Should return 200 on connection", async () => {
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

  it("DELETE /auth - Should return 200 on disconnection", async () => {
    await request(app.getHttpServer()) //
      .delete("/auth")
      .expect(200);
  });

  it("GET /auth/profile - Should return 403 if user is not connected", async () => {
    await request(app.getHttpServer()) //
      .get("/auth/profile")
      .expect(403);
  });

  it("GET /auth/profile - Should return 200 if user is connected", async () => {
    cookie = await getAdminCookie(app);
    await request(app.getHttpServer())
      .get("/auth/profile")
      .set("Cookie", [cookie])
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
