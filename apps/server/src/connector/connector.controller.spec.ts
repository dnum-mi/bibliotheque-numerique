import { Test, TestingModule } from "@nestjs/testing";
import { ConnectorController } from "./connector.controller";
import { ConnectorService } from "./connector.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import configuration from "../config/configuration";
import fileConfig from "../config/file.config";

describe("ConnectorController", () => {
  let controller: ConnectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
      ],
      controllers: [ConnectorController],
      providers: [ConnectorService],
    }).compile();

    controller = module.get<ConnectorController>(ConnectorController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
