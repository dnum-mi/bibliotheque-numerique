import { Test, TestingModule } from "@nestjs/testing";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

describe("FilesService", () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [FilesController],
      providers: [FilesService, ConfigService],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
