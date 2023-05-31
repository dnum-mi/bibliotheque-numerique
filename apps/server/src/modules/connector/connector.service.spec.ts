import { Test, TestingModule } from "@nestjs/testing";
import { ConnectorService } from "./connector.service";
import { HttpModule } from "@nestjs/axios";
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { datasourceTest } from "../../shared/entities/__tests__";

import { dataApiEntreprise } from "./__tests__";
import { connectorTest } from "../../shared/entities/__tests__";
import { Connector } from "./connector.entity";

describe("ConnectorService", () => {
  let service: ConnectorService;
  let dataSource: DataSource;
  let fakeConnector: Connector;
  let id: number;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([Connector]).options)],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);

    fakeConnector = Connector.create();
    for (const entry in dataApiEntreprise) {
      fakeConnector[entry] = dataApiEntreprise[entry];
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ConnectorService],
    }).compile();

    service = module.get<ConnectorService>(ConnectorService);
  });

  afterEach(async () => {
    await Connector.delete({});
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should retrieve data from API_ENTREPRISE STAGING", async () => {
    const result = await service.getResult(fakeConnector, {
      siren_or_rna: "13002526500013",
    });
    expect(result).toHaveProperty("status", 200);
    expect(result).toHaveProperty("data");
    expect(result.data).toHaveProperty("data");
  });

  it("Should create a connector, find it, and remove it", async () => {
    let result = await service.upsert(connectorTest());
    id = result?.id;
    expect(result).toBeDefined();
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("method");
    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("query");
    result = await service.findOneById(id);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("method");
    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("query");
    result = await service.remove(id);
    expect(result).toHaveProperty("affected", 1);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
