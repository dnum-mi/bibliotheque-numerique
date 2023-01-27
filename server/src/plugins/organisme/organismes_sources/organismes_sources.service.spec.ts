import { Test, TestingModule } from "@nestjs/testing";
import { OrganismesSourcesService } from "./organismes_sources.service";

describe("OrganismesSourcesService", () => {
  let service: OrganismesSourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganismesSourcesService],
    }).compile();

    service = module.get<OrganismesSourcesService>(OrganismesSourcesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
