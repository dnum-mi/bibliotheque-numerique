import { Test, TestingModule } from "@nestjs/testing";
import { OrganismesService } from "./organismes.service";

describe("OrganismesService", () => {
  let service: OrganismesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganismesService],
    }).compile();

    service = module.get<OrganismesService>(OrganismesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
