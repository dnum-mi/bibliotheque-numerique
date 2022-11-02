import { Test, TestingModule } from "@nestjs/testing";
import { DossiersDSService } from "./dossiers_ds.service";

describe("DossiersDSService", () => {
  let service: DossiersDSService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DossiersDSService],
    }).compile();

    service = module.get<DossiersDSService>(DossiersDSService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
