import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";

import { Organisme } from "../entities";

import { ConnectorModule } from "../../../modules/connector/connector.module";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

import { OrganismesDatasService } from "../organismes_datas/organismes_datas.service";
import { OrganismesService } from "./organismes.service";
import { getOrganismesData } from "./__tests__/organimsesData";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { loggerServiceMock } from "../../../../test/mock/logger-service.mock";

describe("OrganismesService", () => {
  let service: OrganismesService;
  let dataService: OrganismesDatasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync(typeormFactoryLoader),
        ConnectorModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
        ParseToOrganismesModule,
      ],
      providers: [OrganismesService, OrganismesDatasService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<OrganismesService>(OrganismesService);
    dataService = module.get<OrganismesDatasService>(OrganismesDatasService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create new Organisme", async () => {
    const fakeOrgData = [getOrganismesData()];
    jest
      .spyOn(dataService, "findAndAddByIdRnaFromAllApi")
      .mockResolvedValueOnce([{ status: "fulfilled", value: true }]);

    jest.spyOn(dataService, "findByIdRNA").mockResolvedValueOnce(fakeOrgData);

    await service.upsertOrganisme(fakeOrgData[0].idRef, [
      fakeOrgData[0].organismesSource as unknown as string,
    ]);

    const organismeFound = await Organisme.findOneBy({
      idRef: fakeOrgData[0].idRef,
    });
    expect(organismeFound).toBeDefined();
    expect(organismeFound).toHaveProperty("idRef", fakeOrgData[0].idRef);
    expect(organismeFound).toHaveProperty(
      "title",
      fakeOrgData[0].dataJson.titre,
    );
    expect(organismeFound).toHaveProperty(
      "zipCode",
      fakeOrgData[0].dataJson.adresse_siege.code_postal,
    );
    expect(organismeFound).toHaveProperty(
      "city",
      fakeOrgData[0].dataJson.adresse_siege.commune,
    );
  });

  it("should return one message when a organisme is not found in API", async () => {
    const fakeOrgData = getOrganismesData();
    jest
      .spyOn(dataService, "findAndAddByIdRnaFromAllApi")
      .mockResolvedValueOnce([{ status: "rejected", reason: "test" }]);

    jest.spyOn(dataService, "findByIdRNA").mockResolvedValueOnce([]);

    await expect(
      service.upsertOrganisme(fakeOrgData.idRef, [
        fakeOrgData.organismesSource as unknown as string,
      ]),
    ).rejects.toThrow("No datas for");
  });
});
