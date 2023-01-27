import { Test, TestingModule } from "@nestjs/testing";
import { OrganismesSourcesController } from "./organismes_sources.controller";
import { OrganismesSourcesService } from "./organismes_sources.service";

describe("OrganismesSourcesController", () => {
  let controller: OrganismesSourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganismesSourcesController],
      providers: [OrganismesSourcesService],
    }).compile();

    controller = module.get<OrganismesSourcesController>(
      OrganismesSourcesController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
