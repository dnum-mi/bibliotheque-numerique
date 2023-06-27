import { Test, TestingModule } from "@nestjs/testing";
import { ConnectorService } from "./connector.service";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Connector } from "./connector.entity";
import { typeormFactoryLoader } from "../../shared/utils/typeorm-factory-loader";

//TODO: only test file that break if jest run in band.
describe("ConnectorService", () => {
  let service: ConnectorService;
  // let fakeConnector: Connector;
  // let id: number;

  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
    }).compile();

    // fakeConnector = Connector.create();
    // for (const entry in dataApiEntreprise) {
    //   fakeConnector[entry] = dataApiEntreprise[entry];
    // }
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

  // it("should retrieve data from API_ENTREPRISE STAGING", async () => {
  //   const result = await service.getResult(fakeConnector, {
  //     siren_or_rna: "13002526500013",
  //   });
  //   expect(result).toHaveProperty("status", 200);
  //   expect(result).toHaveProperty("data");
  //   expect(result.data).toHaveProperty("data");
  // });
  //
  // it("Should create a connector, find it, and remove it", async () => {
  //   let result = await service.upsert(connectorTest());
  //   id = result?.id;
  //   expect(result).toBeDefined();
  //   expect(result).toHaveProperty("id");
  //   expect(result).toHaveProperty("url");
  //   expect(result).toHaveProperty("method");
  //   expect(result).toHaveProperty("params");
  //   expect(result).toHaveProperty("query");
  //   result = await service.findOneById(id);
  //   expect(result).toBeDefined();
  //   expect(result).toHaveProperty("id");
  //   expect(result).toHaveProperty("url");
  //   expect(result).toHaveProperty("method");
  //   expect(result).toHaveProperty("params");
  //   expect(result).toHaveProperty("query");
  //   result = await service.remove(id);
  //   expect(result).toHaveProperty("affected", 1);
  // });
});
