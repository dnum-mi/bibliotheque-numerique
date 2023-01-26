import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import exp from "constants";
import { DataSource } from "typeorm";
import { ConnectorModule } from "../../connector/connector.module";
import { ConnectorService } from "../../connector/connector.service";
import { OrganismesData, OrganismesSource } from "../entities";
import {
  createOneOrganismeSource,
  datasourceTest,
  organismeSource_test,
} from "../entities/__tests__";
import { OrganismesDatasService } from "./organismes_datas.service";
import {
  getDatasFromRNA,
  updateOrgFromRNA,
} from "./__tests__/organismeFromRNA";

async function createTestAddOrg(
  connectorService: ConnectorService<OrganismesSource>,
  service: OrganismesDatasService,
) {
  const expected = getDatasFromRNA();
  const idRNA = expected.rna_id;
  jest.spyOn(connectorService, "getResult").mockResolvedValue(expected);
  const orgSrc = await createNewOrgSrc();

  const result = await service.findAndAddByIdRna(idRNA, orgSrc);
  expect(result).toBe(true);
  return { idRNA, expected, orgSrc };
}

async function createNewOrgSrc() {
  const orgSrcTestData = organismeSource_test();
  const orgSrc = await createOneOrganismeSource(orgSrcTestData);
  return orgSrc;
}

describe("OrganismesDatasService", () => {
  let service: OrganismesDatasService;
  let connectorService: ConnectorService<OrganismesSource>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesData, OrganismesSource]).options,
        ),
        ConnectorModule.register(OrganismesSource),
      ],
      providers: [OrganismesDatasService],
    }).compile();

    service = module.get<OrganismesDatasService>(OrganismesDatasService);
    connectorService =
      module.get<ConnectorService<OrganismesSource>>(ConnectorService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await OrganismesData.delete({});
    await OrganismesSource.delete({});
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
    const orgSrc = new OrganismesSource();
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

    jest.spyOn(connectorService, "getResult").mockResolvedValue(expected1);
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

    jest.spyOn(connectorService, "getResult").mockResolvedValue(expected);
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
