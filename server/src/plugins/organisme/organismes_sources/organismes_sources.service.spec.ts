import { Test, TestingModule } from "@nestjs/testing";
import { OrganismesSourcesService } from "./organismes_sources.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { datasourceTest } from "../../../entities/__tests__";
import { OrganismesData, OrganismesSource } from "../entities";
import { DataSource } from "typeorm";
import { organismeSource_test } from "../entities/__tests__";

describe("OrganismesSourcesService", () => {
  let service: OrganismesSourcesService;
  let dataSource: DataSource;
  let id: number;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesSource, OrganismesData]).options,
        ),
      ],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganismesSourcesService],
    }).compile();

    service = module.get<OrganismesSourcesService>(OrganismesSourcesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("Should create an OrganismeSource", async () => {
    const result = await service.upsert(organismeSource_test());
    id = result?.id;
    expect(result).toBeDefined();
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("method");
    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("query");
  });

  it("Should find one OrganismeSource", async () => {
    const result = await service.findOneById(id);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("method");
    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("query");
  });

  it("Should remove one OrganismeSource", async () => {
    const result = await service.remove(id);
    expect(result).toHaveProperty("affected", 1);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
