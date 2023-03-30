import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { DemarchesController } from "./demarches.controller";
import { DemarchesService } from "./demarches.service";
import configuration from "../config/configuration";
import fileConfig from "../config/file.config";
import { HttpModule } from "@nestjs/axios";
import { DemarchesDSService } from "../demarches_ds/demarches_ds.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { datasourceTest } from "../entities/__tests__";
import { Demarche, DemarcheDS, Dossier, DossierDS } from "../entities";
import { getDemarche } from "./__tests__/demarches";
describe("DemarchesController", () => {
  let controller: DemarchesController;
  let service: DemarchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([Demarche, DemarcheDS, Dossier, DossierDS]).options,
        ),
        HttpModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, fileConfig],
        }),
      ],
      controllers: [DemarchesController],
      providers: [DemarchesService, DemarchesDSService],
    }).compile();

    controller = module.get<DemarchesController>(DemarchesController);
    service = module.get<DemarchesService>(DemarchesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return one demarche", async () => {
    const fakeDemarche = getDemarche();
    jest.spyOn(service, "findByDsId").mockResolvedValueOnce(fakeDemarche);
    const fakeReq = {
      user: {
        roles: [{ name: "admin" }],
      },
    };

    expect(await controller.getDemarcheByDsId(fakeReq, fakeDemarche.id)).toBe(
      fakeDemarche,
    );
  });

  it("should return many demarches", async () => {
    const fakeDemarches = [getDemarche(), getDemarche()];
    jest.spyOn(service, "findWithFilter").mockResolvedValueOnce(fakeDemarches);
    const fakeReq = {
      user: {
        roles: [{ name: "admin" }],
      },
    };

    expect(await controller.getDemarches(fakeReq)).toBe(fakeDemarches);
  });
});
