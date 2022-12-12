import { Test, TestingModule } from "@nestjs/testing";
import { DossiersDSService } from "./dossiers_ds.service";
import { DossiersModule } from "../dossiers/dossiers.module";

describe("DossiersDSService", () => {
  let service: DossiersDSService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DossiersModule],
      providers: [DossiersDSService],
    }).compile();

    service = module.get<DossiersDSService>(DossiersDSService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
