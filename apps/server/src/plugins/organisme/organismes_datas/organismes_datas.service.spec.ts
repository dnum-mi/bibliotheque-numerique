import { AxiosResponse } from "axios";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConnectorModule } from "../../../modules/connector/connector.module";
import { ConnectorService } from "../../../modules/connector/connector.service";
import { Organisme, OrganismesData } from "../entities";
import { Connector } from "../../../shared/entities";

import { datasourceTest } from "../entities/__tests__";
import { OrganismesDatasService } from "./organismes_datas.service";
import {
  getDatasFromRNA,
  updateOrgFromRNA,
} from "./__tests__/organismeFromRNA";
import { connectorTest, createOneConnector } from "../../../shared/entities/__tests__";
import { ConfigModule } from "@nestjs/config";
import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";
import { ParseToOrganismesService } from "../parserByConnector/parse_to_organismes.service";
import { IParseToOrganisme } from "../parserByConnector/parse_to_organisme.interface";

async function createTestAddOrg(
  connectorService: ConnectorService,
  service: OrganismesDatasService,
) {
  const expected = getDatasFromRNA();
  const idRNA = expected.rna_id;
  jest.spyOn(connectorService, "getResult").mockResolvedValue({
    data: {
      data: expected,
    },
  } as AxiosResponse);

  const orgSrc = await createNewOrgSrc();

  const result = await service.findAndAddByIdRna(idRNA, orgSrc);
  expect(result).toBe(true);
  return { idRNA, expected, orgSrc };
}

async function createNewOrgSrc() {
  const orgSrcTestData = connectorTest();
  const orgSrc = await createOneConnector(orgSrcTestData);
  return orgSrc;
}

class MockParseToOrg implements IParseToOrganisme<any, any> {
  toOrganismeEntity(organisme: Organisme): Organisme {
    throw new Error("Method not implemented.");
  }
  dataJson: any;
  setDataJson(result: any): void {
    this.dataJson = result?.data?.data;
  }
  getDataUpdateAt(): Date {
    return new Date(this.dataJson.mise_a_jour);
  }
}

describe("OrganismesDatasService", () => {
  let service: OrganismesDatasService;
  let connectorService: ConnectorService;
  let dataSource: DataSource;
  let parserService: ParseToOrganismesService;
  let parser: MockParseToOrg;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([Organisme, OrganismesData, Connector]).options,
        ),
        ConnectorModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
        ParseToOrganismesModule,
      ],
      providers: [OrganismesDatasService],
    }).compile();

    service = module.get<OrganismesDatasService>(OrganismesDatasService);
    connectorService = module.get<ConnectorService>(ConnectorService);
    dataSource = module.get<DataSource>(DataSource);
    parserService = module.get<ParseToOrganismesService>(
      ParseToOrganismesService,
    );
    parser = new MockParseToOrg();
    jest.spyOn(parserService, "getParser").mockReturnValue(() => parser);
  });

  afterEach(async () => {
    await OrganismesData.delete({});
    await Connector.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should add one data in organisme_data from one connnector", async () => {
    const { idRNA, expected } = await createTestAddOrg(
      connectorService,
      service,
    );
    const orgData = await OrganismesData.find();
    expect(orgData[0]).toHaveProperty("idRef", idRNA);
    expect(orgData[0]).toHaveProperty("dataJson");
    expect(orgData[0].dataJson).toMatchObject(expected);
  });

  it("should no add one data in organisme_data from one connnector", async () => {
    const expected = null;
    jest.spyOn(connectorService, "getResult").mockResolvedValue(expected);
    const orgSrc = new Connector();
    orgSrc.url = "https://test.com";

    const result = await service.findAndAddByIdRna("test", orgSrc);
    expect(result).toBe(false);
    const orgData = await OrganismesData.find();
    expect(orgData).toHaveLength(0);
  });

  it("should not add the same data in organisme_data from a same connnector", async () => {
    const { idRNA, expected, orgSrc } = await createTestAddOrg(
      connectorService,
      service,
    );

    const result1 = await service.findAndAddByIdRna(idRNA, orgSrc);
    expect(result1).toBe(false);
    const orgData = await OrganismesData.find();
    expect(orgData).toHaveLength(1);
    expect(orgData[0]).toHaveProperty("idRef", idRNA);
    expect(orgData[0]).toHaveProperty("dataJson");
    expect(orgData[0].dataJson).toMatchObject(expected);
  });

  it("should update the existing data in organisme_data from a same connnector", async () => {
    const { idRNA, expected, orgSrc } = await createTestAddOrg(
      connectorService,
      service,
    );
    const expected1 = updateOrgFromRNA(expected);

    jest.spyOn(connectorService, "getResult").mockResolvedValue({
      data: {
        data: expected1,
      },
    } as AxiosResponse);

    const result = await service.findAndAddByIdRna(idRNA, orgSrc);
    expect(result).toBe(true);
    const orgData = await OrganismesData.find();

    expect(orgData[0]).toHaveProperty("idRef", idRNA);
    expect(orgData[0]).toHaveProperty("dataJson");
    expect(orgData[0].dataJson).toMatchObject(expected1);
  });

  it("should add one data in organisme_data from another connnector", async () => {
    const { idRNA, expected } = await createTestAddOrg(
      connectorService,
      service,
    );

    jest.spyOn(connectorService, "getResult").mockResolvedValue({
      data: {
        data: expected,
      },
    } as AxiosResponse);
    const orgSrc = await createNewOrgSrc();
    const result = await service.findAndAddByIdRna(idRNA, orgSrc);
    expect(result).toBe(true);

    const orgData = await OrganismesData.find({
      relations: {
        organismesSource: true,
      },
    });

    expect(orgData).toHaveLength(2);
  });
});
