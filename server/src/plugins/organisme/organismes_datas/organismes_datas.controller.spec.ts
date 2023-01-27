import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConnectorModule } from "../../connector/connector.module";
import { OrganismesData, OrganismesSource } from "../entities";
import { datasourceTest } from "../entities/__tests__";
import { OrganismesDatasController } from "./organismes_datas.controller";
import { OrganismesDatasService } from "./organismes_datas.service";

describe("OrganismesDatasController", () => {
  let controller: OrganismesDatasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesData, OrganismesSource]).options,
        ),
        ConnectorModule.register(OrganismesSource),
      ],

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
