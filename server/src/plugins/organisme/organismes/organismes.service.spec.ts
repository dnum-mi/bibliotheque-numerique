import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";

import { datasourceTest } from "../entities/__tests__";
import { Connector } from "../../../entities";
import { Organisme, OrganismesData } from "../entities";

import { ConnectorModule } from "../../../connector/connector.module";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

import { OrganismesDatasService } from "../organismes_datas/organismes_datas.service";
import { OrganismesService } from "./organismes.service";
import { getOrganismesData } from "./__tests__/organimsesData";

describe("OrganismesService", () => {
  let service: OrganismesService;
  let dataService: OrganismesDatasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([Connector, OrganismesData, Organisme]).options,
        ),
        ConnectorModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
        ParseToOrganismesModule,
      ],
      providers: [OrganismesService, OrganismesDatasService],
    }).compile();

    service = module.get<OrganismesService>(OrganismesService);
    dataService = module.get<OrganismesDatasService>(OrganismesDatasService);
  });

  // afterEach(async () => {
  // await OrganismesData.delete({});
  // await Connector.delete({});
  // })

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create new Orgnisme", async () => {
    const fakeOrgData = getOrganismesData();
    jest
      .spyOn(dataService, "findAndAddByIdRnaFromAllApi")
      .mockResolvedValueOnce([{ status: "fulfilled", value: 1 }]);

    jest
      .spyOn(dataService, "findOneByIdRNA")
      .mockResolvedValueOnce(fakeOrgData);

    const org = await service.upsertOrganisme(fakeOrgData.idRef, [
      fakeOrgData.organismesSource,
    ]);

    const organismeFound = await Organisme.findOneBy({
      idRef: fakeOrgData.idRef,
    });
    expect(organismeFound).toBeDefined();
    expect(organismeFound).toHaveProperty("idRef", fakeOrgData.idRef);
    expect(organismeFound).toHaveProperty("title", fakeOrgData.dataJson.titre);
    expect(organismeFound).toHaveProperty(
      "zipCode",
      fakeOrgData.dataJson.adresse_siege.code_postal,
    );
    expect(organismeFound).toHaveProperty(
      "city",
      fakeOrgData.dataJson.adresse_siege.commune,
    );
  });

  it("should return one message when a organisme is not found in API", async () => {
    const fakeOrgData = getOrganismesData();
    jest
      .spyOn(dataService, "findAndAddByIdRnaFromAllApi")
      .mockResolvedValueOnce([{ status: "rejected", reason: "test" }]);

    jest.spyOn(dataService, "findOneByIdRNA").mockResolvedValueOnce(null);

    await expect(
      service.upsertOrganisme(fakeOrgData.idRef, [
        fakeOrgData.organismesSource,
      ]),
    ).rejects.toThrow("No datas for");
  });
});
