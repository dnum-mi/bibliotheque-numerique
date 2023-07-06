import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { DemarchesController } from "./demarches.controller";
import { DemarchesService } from "../providers/demarches.service";
import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";
import { HttpModule } from "@nestjs/axios";
import { DemarchesDSService } from "../providers/demarches_ds.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DossiersDSService } from "../../dossiers/providers/dossiers_ds.service";
import { DossiersService } from "../../dossiers/providers/dossiers.service";
import { FilesService } from "../../files/files.service";
import dsConfig from "../../../config/ds.config";
import instructionTimeMappingConfig from "../../../plugins/instruction_time/config/instructionTimeMapping.config";
import { InstructionTimesModule } from "../../../plugins/instruction_time/instruction_times/instruction_times.module";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { loggerServiceMock } from "../../../../test/mock/logger-service.mock";
import { getFakeDemarche } from "../../../../test/unit/fake-data/demarche.fake-data";
import { Demarche } from "../entities/demarche.entity";
import { DemarcheDS } from "../entities/demarche_ds.entity";
import { Dossier } from "../../dossiers/entities/dossier.entity";
import { DossierDS } from "../../dossiers/entities/dossier_ds.entity";
import { FileStorage } from "../../files/file_storage.entity";

describe("DemarchesController", () => {
  let controller: DemarchesController;
  let service: DemarchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // TODO: typeorm should not be imported for unit test, neither should it be imported twice for connection and injection
        TypeOrmModule.forRootAsync(typeormFactoryLoader),
        TypeOrmModule.forFeature([
          Demarche,
          DemarcheDS,
          Dossier,
          DossierDS,
          FileStorage,
        ]),
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
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    controller = module.get<DemarchesController>(DemarchesController);
    service = module.get<DemarchesService>(DemarchesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return one demarche", async () => {
    const fakeDemarche = getFakeDemarche();
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
    const fakeDemarches = [getFakeDemarche(), getFakeDemarche()];
    jest.spyOn(service, "findWithPermissions").mockResolvedValue(fakeDemarches);
    const fakeReq = {
      user: {
        roles: [{ name: "admin" }],
      },
    };
    expect(await controller.getDemarches(fakeReq)).toBe(fakeDemarches);
  });
});
