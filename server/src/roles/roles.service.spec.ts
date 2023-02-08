import { Test, TestingModule } from "@nestjs/testing";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { ConfigModule } from "@nestjs/config";
import configuration from "../config/configuration";
import fileConfig from "../config/file.config";

describe("RolesService", () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
      ],
      controllers: [RolesController],
      providers: [RolesService],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
