import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TestingModuleFactory } from "../common/testing-module.factory";
import { dataSource } from "../data-source-e2e.typeorm";

describe("Dossier listing", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestingModuleFactory();
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  // it("shoud return 403 if not connected", () => {
  //
  // });
  //
  // it("shoud return 200 on connection", async () => {
  //
  // });
});
