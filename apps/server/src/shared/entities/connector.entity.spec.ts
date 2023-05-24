import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Connector } from "./index";
import { datasourceTest, connectorTest, createOneConnector } from "./__tests__";
import { DataSource } from "typeorm";

describe("ConnectorSource.entity", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(datasourceTest([Connector]).options)],
    }).compile();
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await Connector.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("create entity", async () => {
    const data = connectorTest();

    const connectorSource = await createOneConnector(data);

    expect(connectorSource).toHaveProperty("id");
    expect(connectorSource).toMatchObject(data);
    const nowDate = new Date().toDateString();
    expect(connectorSource.createAt.toDateString()).toBe(nowDate);
    expect(connectorSource.updateAt.toDateString()).toBe(nowDate);
  });
});
