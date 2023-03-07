import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConnectorModule } from "../../../connector/connector.module";
import { OrganismesData } from "../entities";
import { Connector } from "../../../entities";
import { datasourceTest } from "../entities/__tests__";
import { OrganismesDatasController } from "./organismes_datas.controller";
import { OrganismesDatasService } from "./organismes_datas.service";
import { ConfigModule } from "@nestjs/config";
import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

describe("OrganismesDatasController", () => {
  let controller: OrganismesDatasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([OrganismesData, Connector]).options,
        ),
        ConnectorModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
        ParseToOrganismesModule,
      ],

      controllers: [OrganismesDatasController],
      providers: [OrganismesDatasService],
    }).compile();

    controller = module.get<OrganismesDatasController>(
      OrganismesDatasController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
