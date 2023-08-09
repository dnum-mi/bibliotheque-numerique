/* eslint-disable */
import { AxiosResponse } from "axios";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConnectorModule } from "../../../modules/connector/connector.module";
import { ConnectorService } from "../../../modules/connector/connector.service";

import { OrganismesDatasService } from "./organismes_datas.service";
import { ConfigModule } from "@nestjs/config";
import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";
import { ParseToOrganismesService } from "../parserByConnector/parse_to_organismes.service";
import { IParseToOrganisme } from "../parserByConnector/parse_to_organisme.interface";
import { Connector, AuthTypes } from "../../../modules/connector/connector.entity";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";
import { faker } from "@faker-js/faker/locale/fr";
import { getFakeDatasFromRNA, getFakeUpdateOrgFromRNA } from "../../../../test/unit/fake-data/organisme-data.fake-data";
import { Organisme } from "./organisme.entity";
import { OrganismesData } from "./organisme_data.entity";

const connectorTest = (): Partial<Connector> => ({
  name: faker.internet.userName(),
  method: faker.helpers.arrayElement(["GET", "POST"]),
  url: faker.internet.url(),
  params: faker.datatype.array(2).map((a) => a.toString()),
  query: {
    query1: faker.datatype.string(5),
    query2: faker.datatype.string(5),
  },
  typeAuth: AuthTypes.BEARER_TOKEN,
  token: faker.internet.password(),
});

async function createTestAddOrg(
  connectorService: ConnectorService,
  service: OrganismesDatasService,
) {
  const expected = getFakeDatasFromRNA();
  const idRNA = expected.rna_id;
  jest.spyOn(connectorService, "getResult").mockResolvedValue({
    data: {
      data: expected,
    },
  } as AxiosResponse);

  const orgSrc = await createNewOrgSrc(connectorService);

  const result = await service.findAndAddByIdRna(idRNA, orgSrc);
  expect(result).toBe(true);
  return { idRNA, expected, orgSrc };
}

async function createNewOrgSrc(connectorService: ConnectorService) {
  const orgSrcTestData = connectorTest();
  return connectorService.repository.create(orgSrcTestData);
}

class MockParseToOrg implements IParseToOrganisme<any, any> {
  toOrganismeEntity(): Organisme {
    throw new Error("Method not implemented.");
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataJson: any;
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  let parserService: ParseToOrganismesService;
  let parser: MockParseToOrg;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // TODO: typeorm should not be imported for unit test, neither should it be imported twice for connection and injection
        TypeOrmModule.forRootAsync(typeormFactoryLoader),
        TypeOrmModule.forFeature([OrganismesData]),
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
    parserService = module.get<ParseToOrganismesService>(
      ParseToOrganismesService,
    );
    parser = new MockParseToOrg();
    jest.spyOn(parserService, "getParser").mockReturnValue(() => parser);
  });

  afterEach(async () => {
    await service.repository.delete({});
    await connectorService.repository.delete({});
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should add one data in organisme_data from one connnector", async () => {
    const { idRNA, expected } = await createTestAddOrg(
      connectorService,
      service,
    );
    const orgData = await service.repository.find();
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
    const orgData = await service.repository.find();
    expect(orgData).toHaveLength(0);
  });

  it("should not add the same data in organisme_data from a same connnector", async () => {
    const { idRNA, expected, orgSrc } = await createTestAddOrg(
      connectorService,
      service,
    );

    const result1 = await service.findAndAddByIdRna(idRNA, orgSrc);
    expect(result1).toBe(false);
    const orgData = await service.repository.find();
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
    const expected1 = getFakeUpdateOrgFromRNA(expected);

    jest.spyOn(connectorService, "getResult").mockResolvedValue({
      data: {
        data: expected1,
      },
    } as AxiosResponse);

    const result = await service.findAndAddByIdRna(idRNA, orgSrc);
    expect(result).toBe(true);
    const orgData = await service.repository.find();

    expect(orgData[0]).toHaveProperty("idRef", idRNA);
    expect(orgData[0]).toHaveProperty("dataJson");
    expect(orgData[0].dataJson).toMatchObject(expected1);
  });


  // TODO: repair test
  // it("should add one data in organisme_data from another connnector", async () => {
  //   const { idRNA, expected } = await createTestAddOrg(
  //     connectorService,
  //     service,
  //   );
  //
  //   jest.spyOn(connectorService, "getResult").mockResolvedValue({
  //     data: {
  //       data: expected,
  //     },
  //   } as AxiosResponse);
  //   const orgSrc = await createNewOrgSrc(connectorService);
  //   console.log('debut')
  //   const result = await service.findAndAddByIdRna(idRNA, orgSrc);
  //   console.log('fin')
  //   expect(result).toBe(true);
  //
  //   const orgData = await OrganismesData.find({
  //     relations: {
  //       organismesSource: true,
  //     },
  //   });
  //
  //   expect(orgData).toHaveLength(2);
  // });
});
