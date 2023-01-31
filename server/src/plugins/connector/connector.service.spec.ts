import { Test, TestingModule } from "@nestjs/testing";
import { ConnectorService } from "./connector.service";
import { OrganismesData, OrganismesSource } from "../organisme/entities";
import { HttpModule } from "@nestjs/axios";
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { datasourceTest } from "../../entities/__tests__";

import { dataApiEntreprise } from "./__tests__/";

describe("ConnectorService", () => {
  let service: ConnectorService<OrganismesSource>;
  let dataSource: DataSource;
  let fakeOrganismesSource: OrganismesSource;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesSource, OrganismesData]).options,
        ),
      ],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);

    fakeOrganismesSource = OrganismesSource.create();
    for (const entry in dataApiEntreprise) {
      fakeOrganismesSource[entry] = dataApiEntreprise[entry];
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useFactory: () => ({
            timeout: 5000,
            maxRedirects: 5,
          }),
        }),
      ],
      providers: [
        {
          provide: "SOURCE_PROVIDER",
          useValue: OrganismesSource,
        },
        ConnectorService,
      ],
    }).compile();

    service = module.get<ConnectorService<OrganismesSource>>(ConnectorService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should retrieve data from API_ENTREPRISE STAGING", async () => {
    const result = await service.getResult(fakeOrganismesSource, {
      siren_or_rna: "13002526500013",
    });
    expect(result).toHaveProperty("status", 200);
    expect(result).toHaveProperty("data");
    expect(result.data).toHaveProperty("data");
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
