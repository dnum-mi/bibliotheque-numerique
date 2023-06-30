import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { createTestingModule } from "@/test/create-testing-module";

describe("Ds Controller (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const values = await createTestingModule();
    app = values.app;
  });

  it("GET /ds/url - Should return DS url", async () => {
    return await request(app.getHttpServer()).get("/api/ds/url").expect(200).expect({
      url: "no-url-for-e2e-test",
    });
  });
});
