import { Test, TestingModule } from "@nestjs/testing";
import { OrganismesDatasService } from "./organismes_datas.service";

describe("OrganismesDatasService", () => {
  let service: OrganismesDatasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganismesDatasService],
    }).compile();

    service = module.get<OrganismesDatasService>(OrganismesDatasService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
