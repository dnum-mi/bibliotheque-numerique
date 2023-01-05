import { Test, TestingModule } from "@nestjs/testing";
import { Organismes_sourcesService } from "./organismes_sources.service";

describe("OrganismesSourcesService", () => {
  let service: Organismes_sourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Organismes_sourcesService],
    }).compile();

    service = module.get<Organismes_sourcesService>(Organismes_sourcesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
