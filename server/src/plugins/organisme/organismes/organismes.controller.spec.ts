import { Test, TestingModule } from "@nestjs/testing";
import { OrganismesController } from "./organismes.controller";
import { OrganismesService } from "./organismes.service";

describe("OrganismesController", () => {
  let controller: OrganismesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganismesController],
      providers: [OrganismesService],
    }).compile();

    controller = module.get<OrganismesController>(OrganismesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
