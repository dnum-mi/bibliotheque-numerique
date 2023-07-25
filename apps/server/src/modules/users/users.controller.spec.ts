import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { UsersModule } from "./users.module";
import { UsersService } from "./users.service";
import { HttpStatus, INestApplication } from "@nestjs/common";

describe.skip("Users", () => {
  let app: INestApplication;
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const usersService = { findAll: () => ["test"] };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  it(`/GET users`, () => {
    return (
      request(app.getHttpServer())
        // @ts-ignore The property 'get' really exists
        .get("/users")
        .expect(HttpStatus.FORBIDDEN)
    );
  });

  it(`/GET users with admin rights`, async () => {
    // TODO: Fix this test
    // expect(await controller.listUsers(fakeReq)).toBe(fakeDemarches);
  });

  afterAll(async () => {
    await app?.close();
  });
});
