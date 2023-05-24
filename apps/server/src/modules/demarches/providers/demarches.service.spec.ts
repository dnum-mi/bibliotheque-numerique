import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { DemarchesController } from "../controllers/demarches.controller";
import { DemarchesService } from "./demarches.service";
import configuration from "../../../config/configuration";
import fileConfig from "../../../config/file.config";
import { HttpModule } from "@nestjs/axios";
import { DemarchesDSService } from "./demarches_ds.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { datasourceTest, user_test } from "../../../shared/entities/__tests__";
import {
  Demarche,
  DemarcheDS,
  Dossier,
  DossierDS,
  User,
} from "../../../shared/entities";
import { getDemarche } from "../__tests__/demarches";
import { DossiersDSModule } from "../../dossiers_ds/dossiers_ds.module";
import dsConfig from "../../../config/ds.config";
import instructionTimeMappingConfig from "../../../plugins/instruction_time/config/instructionTimeMapping.config";
import { InstructionTimesModule } from "../../../plugins/instruction_time/instruction_times/instruction_times.module";

describe("DemarchesService", () => {
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
        DossiersModule,
        InstructionTimesModule,
      ],
      controllers: [DemarchesController],
      providers: [DemarchesService, DemarchesDSService],
    }).compile();

    service = module.get<DemarchesService>(DemarchesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return one demarche", async () => {
    const fakeDemarche = getDemarche();
    jest.spyOn(service, "findByDsId").mockResolvedValueOnce(fakeDemarche);
    expect(await service.findByDsId(fakeDemarche.id)).toBe(fakeDemarche);
  });

  it("should return many demarches", async () => {
    const fakeDemarches = [getDemarche(), getDemarche()];
    jest.spyOn(service, "findWithFilter").mockResolvedValueOnce(fakeDemarches);
    const fakeUser = user_test() as unknown as User;

    expect(await service.findWithFilter(fakeUser)).toBe(fakeDemarches);
  });
});
