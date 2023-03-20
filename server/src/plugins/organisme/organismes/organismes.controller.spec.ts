import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";

import { Organisme } from "../entities";
import { datasourceTest } from "../entities/__tests__";

import { ConnectorModule } from "../../../connector/connector.module";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

import { OrganismesController } from "./organismes.controller";

import { OrganismesDatasService } from "../organismes_datas/organismes_datas.service";
import { OrganismesService } from "./organismes.service";

describe("OrganismesController", () => {
  let controller: OrganismesController;
  let dataService: OrganismesDatasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(datasourceTest([Organisme]).options),
        ParseToOrganismesModule,
        ConnectorModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
      ],
      controllers: [OrganismesController],
      providers: [OrganismesService, OrganismesDatasService],
    }).compile();

    controller = module.get<OrganismesController>(OrganismesController);
    dataService = module.get<OrganismesDatasService>(OrganismesDatasService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return one message when a organisme is not found in API", async () => {
    jest
      .spyOn(dataService, "findAndAddByIdRnaFromAllApi")
      .mockResolvedValueOnce([{ status: "rejected", reason: "test" }]);

    jest.spyOn(dataService, "findOneByIdRNA").mockResolvedValueOnce(null);

    const idRNA = "Test id RNA";
    await expect(
      controller.addOrgnaismeByIdRNA("Test id RNA", "Test organisme source"),
    ).rejects.toThrow(`organimse RNA: ${idRNA} not found`);
  });
});
