import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";

import { ConnectorModule } from "../../../modules/connector/connector.module";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

import { OrganismesController } from "./organismes.controller";

import { OrganismesDatasService } from "./organismes_datas.service";
import { OrganismesService } from "./organismes.service";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { loggerServiceMock } from "../../../../test/mock/logger-service.mock";
import { Organisme } from "./organisme.entity";
import { OrganismesData } from "./organisme_data.entity";

describe("OrganismesController", () => {
  let controller: OrganismesController;
  let dataService: OrganismesDatasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // TODO: typeorm should not be imported for unit test, neither should it be imported twice for connection and injection
        TypeOrmModule.forRootAsync(typeormFactoryLoader),
        TypeOrmModule.forFeature([Organisme, OrganismesData]),
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
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

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

    jest.spyOn(dataService, "findByIdRNA").mockResolvedValueOnce([]);

    await expect(
      controller.addOrganismeByIdRNA("Test id RNA", "Test organisme source"),
    ).rejects.toThrow(`No datas for Test id RNA`);
  });
});
