import { Test, TestingModule } from "@nestjs/testing";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { ConfigModule } from "@nestjs/config";

describe("RolesController", () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [RolesController],
      providers: [RolesService],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
