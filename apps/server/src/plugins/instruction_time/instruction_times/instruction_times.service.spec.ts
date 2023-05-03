import { Test, TestingModule } from "@nestjs/testing";
import { InstructionTimesService } from "./instruction_times.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "../../../config/configuration";
import instructionTimeMappingConfig, {
  TInstructionTimeMappingConfig,
} from "../config/instructionTimeMapping.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  datasourceTest,
  dossier_ds_test,
  dossier_test,
} from "../../../entities/__tests__";
import { InstructionTime } from "../entities";
import { Demarche, DemarcheDS, Dossier, DossierDS } from "../../../entities";
import { faker } from "@faker-js/faker/locale/fr";
import { EInstructionTimeState } from "../types/IntructionTime.type";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";

describe("InstructionTimesService", () => {
  let service: InstructionTimesService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          datasourceTest([
            InstructionTime,
            Dossier,
            DossierDS,
            Demarche,
            DemarcheDS,
          ]).options,
        ),
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, instructionTimeMappingConfig],
        }),
      ],
      providers: [InstructionTimesService],
    }).compile();

    service = module.get<InstructionTimesService>(InstructionTimesService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("It should return good annotations", async () => {
    const fakeDossierDs = dossier_ds_test();
    const fakeDossier = dossier_test(fakeDossierDs as DossierDS);
    jest
      .spyOn(Dossier, "findOne")
      .mockResolvedValueOnce(fakeDossier as Dossier);

    const instructionTimeMappingConfig = configService.get<
      TInstructionTimeMappingConfig["instructionTimeMappingConfig"]
    >("instructionTimeMappingConfig");

    fakeDossier.dossierDS.dataJson.annotations = [
      {
        id: faker.datatype.uuid(),
        date: "2021-02-01",
        label: instructionTimeMappingConfig.DateReceipt1,
      },
      {
        id: faker.datatype.uuid(),
        date: "2021-04-02",
        label: instructionTimeMappingConfig.DateReceipt2,
      },
      {
        id: faker.datatype.uuid(),
        date: "2021-01-01",
        label: instructionTimeMappingConfig.DateRequest1,
      },
      {
        id: faker.datatype.uuid(),
        date: "2021-03-15",
        label: instructionTimeMappingConfig.DateRequest2,
      },
      {
        id: faker.datatype.uuid(),
        datetime: "2021-07-01T00:00:00.000Z",
        label: instructionTimeMappingConfig.DurationExtension,
      },
    ] as any;

    expect(
      await service.getMappingInstructionTimeByDossierId(fakeDossier.id),
    ).toEqual({
      BeginProrogationDate: null,
      DateReceipt1: new Date("2021-02-01T00:00:00.000Z"),
      DateReceipt2: new Date("2021-04-02T00:00:00.000Z"),
      DateRequest1: new Date("2021-01-01T00:00:00.000Z"),
      DateRequest2: new Date("2021-03-15T00:00:00.000Z"),
      DurationExtension: new Date("2021-07-01T00:00:00.000Z"),
    });
  });

  it("It should return good times instruction for a list a dossiers", async () => {
    const instructionTimeMappingConfig = configService.get<
      TInstructionTimeMappingConfig["instructionTimeMappingConfig"]
    >("instructionTimeMappingConfig");

    const fakeDossiers: Partial<Dossier>[] = [];
    for (let i = 1; i <= 3; i++) {
      const fakeDossierDs = dossier_ds_test();
      const fakeDossier = dossier_test(fakeDossierDs as DossierDS);
      fakeDossier.id = i;
      fakeDossiers.push(fakeDossier);
    }

    jest
      .spyOn(Dossier, "find")
      .mockResolvedValueOnce(fakeDossiers as Dossier[]);

    fakeDossiers["1"].dossierDS.dataJson.state = DossierState.EnConstruction;
    fakeDossiers["1"].dossierDS.dataJson.annotations = [
      {
        id: faker.datatype.uuid(),
        date: "2021-02-01",
        label: instructionTimeMappingConfig.DateRequest1,
      },
    ] as any;

    expect(
      await service.instructionTimeCalculation(fakeDossiers.map((d) => d.id)),
    ).toEqual({
      "1": {
        remainingTime: null,
        delayStatus: null,
      },
      "2": {
        remainingTime: null,
        delayStatus: EInstructionTimeState.FIRST_REQUEST,
      },
      "3": {
        remainingTime: null,
        delayStatus: null,
      },
    });
  });
});
