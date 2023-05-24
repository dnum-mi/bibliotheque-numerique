import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { DemarchesController } from "./demarches.controller";
import { DemarchesService } from "./demarches.service";
import configuration from "../../config/configuration";
import fileConfig from "../../config/file.config";
import { HttpModule } from "@nestjs/axios";
import { DemarchesDSService } from "../providers/demarches_ds.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { datasourceTest } from "../../shared/entities/__tests__";
import { Demarche, DemarcheDS, Dossier, DossierDS } from "../../shared/entities";
import { getDemarche } from "./__tests__/demarches";
import { DossiersDSService } from "../dossiers_ds/dossiers_ds.service";
import { DossiersService } from "../dossiers/dossiers.service";
import { FilesService } from "../files/files.service";
import dsConfig from "../../config/ds.config";
import instructionTimeMappingConfig from "../../plugins/instruction_time/config/instructionTimeMapping.config";
import { InstructionTimesModule } from "../../plugins/instruction_time/instruction_times/instruction_times.module";
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
          load: [
            configuration,
            fileConfig,
            dsConfig,
            instructionTimeMappingConfig,
          ],
        }),
        InstructionTimesModule,
      ],
      controllers: [DemarchesController],
      providers: [
        DemarchesService,
        DemarchesDSService,
        DossiersDSService,
        DossiersService,
        FilesService,
      ],
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
