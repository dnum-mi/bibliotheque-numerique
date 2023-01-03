import { Test, TestingModule } from "@nestjs/testing";
import { OrganismesSourcesController } from "./organismes_sources_controller";
import { Organismes_sourcesService } from "./organismes_sources.service";

describe("OrganismesSourcesController", () => {
  let controller: OrganismesSourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganismesSourcesController],
      providers: [Organismes_sourcesService],
    }).compile();

    controller = module.get<OrganismesSourcesController>(
      OrganismesSourcesController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
