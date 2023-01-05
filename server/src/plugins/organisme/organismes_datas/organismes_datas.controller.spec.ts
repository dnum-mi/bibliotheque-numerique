import { Test, TestingModule } from "@nestjs/testing";
import { OrganismesDatasController } from "./organismes_datas.controller";
import { OrganismesDatasService } from "./organismes_datas.service";

describe("OrganismesDatasController", () => {
  let controller: OrganismesDatasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganismesDatasController],
      providers: [OrganismesDatasService],
    }).compile();

    controller = module.get<OrganismesDatasController>(
      OrganismesDatasController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
