import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";

import { Organisme } from "../entities";
import { datasourceTest } from "../entities/__tests__";

import { ConnectorModule } from "../../../connector/connector.module";
import { ParseToOrganismesModule } from "../parserByConnector/parse_to_organismes.module";

import { OrganismesController } from "./organismes.controller";

import { OrganismesDatasService } from "../organismes_datas/organismes_datas.service";
import { OrganismesService } from "./organismes.service";

describe("OrganismesController", () => {
  let controller: OrganismesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(datasourceTest([Organisme]).options),
        ParseToOrganismesModule,
        ConnectorModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
      ],
      controllers: [OrganismesController],
      providers: [OrganismesService, OrganismesDatasService],
    }).compile();

    controller = module.get<OrganismesController>(OrganismesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
