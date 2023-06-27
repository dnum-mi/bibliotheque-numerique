import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  connectorTest,
  createOneConnector,
} from "../../shared/entities/__tests__";
import { Connector } from "./connector.entity";
import { typeormFactoryLoader } from "../../shared/utils/typeorm-factory-loader";

describe("ConnectorSource.entity", () => {
  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [TypeOrmModule.forRootAsync(typeormFactoryLoader)],
    }).compile();
  });

  afterEach(async () => {
    await Connector.delete({});
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
