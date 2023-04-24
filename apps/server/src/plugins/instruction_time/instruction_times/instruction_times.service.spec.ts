import { Test, TestingModule } from "@nestjs/testing";
import { InstructionTimesService } from "./instruction_times.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "../../../config/configuration";
import instructionTimeMappingConfig, {
  TInstructionTimeMappingConfig,
  keyInstructionTime,
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
import { DataSource } from "typeorm";

describe("InstructionTimesService", () => {
  let service: InstructionTimesService;
  let configService: ConfigService;
  let dataSource: DataSource;

  beforeAll(async () => {
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
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
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

  const fakerDossierInConstructionOrClos = () =>
    faker.helpers.arrayElement([
      DossierState.EnConstruction,
      DossierState.Accepte,
      DossierState.Refuse,
      DossierState.SansSuite,
    ]);

  const fakerDateOrNull = (date) => faker.helpers.arrayElement([date, null]);

  it.each`
    cas                                                 | state                                 | dateInstrution                      | firstDemand                                          | firstReceip                                            | secondDemand                                      | secondReceip                                           | dateProrogation                                                    | dateIntentOppo
    ${"In building"}                                    | ${fakerDossierInConstructionOrClos()} | ${null}                             | ${null}                                              | ${null}                                                | ${null}                                           | ${null}                                                | ${null}                                                            | ${null}
    ${"In building with 1st Demand"}                    | ${fakerDossierInConstructionOrClos()} | ${faker.date.past().toISOString()}  | ${fakerDateOrNull(faker.date.past(1, "2020-01-01"))} | ${null}                                                | ${null}                                           | ${null}                                                | ${null}                                                            | ${null}
    ${"In building with receip of 1st Demand"}          | ${fakerDossierInConstructionOrClos()} | ${faker.date.past().toISOString()}  | ${faker.date.past(1, "2020-01-01")}                  | ${fakerDateOrNull(faker.date.future(1, "2020-01-01"))} | ${null}                                           | ${null}                                                | ${null}                                                            | ${null}
    ${"In building with all dates"}                     | ${fakerDossierInConstructionOrClos()} | ${faker.date.past().toISOString()}  | ${faker.date.past(1, "2020-01-01")}                  | ${fakerDateOrNull(faker.date.future(1, "2020-01-01"))} | ${fakerDateOrNull(faker.date.past())}             | ${fakerDateOrNull(faker.date.past())}                  | ${fakerDateOrNull(faker.date.past())}                              | ${null}
    ${"In instruction with all dates"}                  | ${DossierState.EnInstruction}         | ${faker.date.past(1, "2020-01-01")} | ${faker.date.past(1, "2020-01-01")}                  | ${fakerDateOrNull(faker.date.future(1, "2020-01-01"))} | ${faker.date.between("2020-02-01", "2020-03-01")} | ${fakerDateOrNull(faker.date.future(1, "2020-03-01"))} | ${faker.date.past(1, "2020-02-01")}                                | ${null}
    ${"In instruction without the dates of 1st Demand"} | ${DossierState.EnInstruction}         | ${faker.date.past(1, "2020-01-01")} | ${null}                                              | ${null}                                                | ${faker.date.between("2020-02-01", "2020-03-01")} | ${fakerDateOrNull(faker.date.future(1, "2020-03-01"))} | ${faker.date.past(1, "2020-02-01")}                                | ${null}
    ${"In instruction with the date extension only"}    | ${DossierState.EnInstruction}         | ${faker.date.past(1, "2020-01-01")} | ${null}                                              | ${null}                                                | ${null}                                           | ${null}                                                | ${faker.date.future(1, "2020-02-01")}                              | ${null}
    ${"In instruction with the date intent opppositon"} | ${DossierState.EnInstruction}         | ${faker.date.past(1, "2020-01-01")} | ${null}                                              | ${null}                                                | ${null}                                           | ${null}                                                | ${fakerDateOrNull(faker.date.between("2020-02-01", "2020-03-01"))} | ${faker.date.future(1, "2020-03-01")}
  `(
    "cas $cas: Should check of validities of date",
    ({
      state,
      dateInstrution,
      firstDemand,
      firstReceip,
      secondDemand,
      secondReceip,
      dateProrogation,
      dateIntentOppo,
    }) => {
      const dossier: DossierDS = new DossierDS();
      dossier.dataJson = {};
      dossier.dataJson.state = state;
      dossier.dataJson.datePassageEnInstruction = dateInstrution;
      const instuctionTimes = {
        [keyInstructionTime.DATE_REQUEST1]: firstDemand,
        [keyInstructionTime.DATE_RECEIPT1]: firstReceip,
        [keyInstructionTime.BEGIN_PROROGATION_DATE]: dateProrogation,
        [keyInstructionTime.DATE_REQUEST2]: secondDemand,
        [keyInstructionTime.DATE_RECEIPT2]: secondReceip,
        [keyInstructionTime.DATE_INTENT_OPPOSITION]: dateIntentOppo,
      };
      const result = service.checkValidity(dossier.dataJson, instuctionTimes);
      expect(result).toBe(true);
    },
  );

  it.each`
    cas                                                                 | state                                 | dateInstrution                                      | firstDemand                                            | firstReceip                         | secondDemand                                           | secondReceip                                           | dateProrogation                                        | dateIntentOppo
    ${"In building with 1st demande after 1st receipt"}                 | ${fakerDossierInConstructionOrClos()} | ${fakerDateOrNull(faker.date.past().toISOString())} | ${fakerDateOrNull(faker.date.future(1, "2020-01-01"))} | ${faker.date.past(1, "2020-01-01")} | ${null}                                                | ${null}                                                | ${null}                                                | ${null}
    ${"In instruction undated"}                                         | ${DossierState.EnInstruction}         | ${null}                                             | ${null}                                                | ${null}                             | ${null}                                                | ${null}                                                | ${null}                                                | ${null}
    ${"In instruction, prorogation before instruction date"}            | ${DossierState.EnInstruction}         | ${faker.date.future(1, "2020-01-01")}               | ${null}                                                | ${null}                             | ${null}                                                | ${null}                                                | ${faker.date.past(1, "2020-01-01")}                    | ${null}
    ${"In instruction, prorogation after 2nd demand"}                   | ${DossierState.EnInstruction}         | ${faker.date.past(1, "2020-01-01")}                 | ${null}                                                | ${null}                             | ${faker.date.between("2020-02-01", "2020-03-01")}      | ${fakerDateOrNull(faker.date.future(1, "2020-03-01"))} | ${fakerDateOrNull(faker.date.future(1, "2020-03-01"))} | ${null}
    ${"In instruction, 2nd demand after 2nd receipt date"}              | ${DossierState.EnInstruction}         | ${faker.date.past(1, "2020-01-01")}                 | ${null}                                                | ${null}                             | ${fakerDateOrNull(faker.date.future(1, "2020-01-01"))} | ${faker.date.past(1, "2020-01-01")}                    | ${null}                                                | ${null}
    ${"In instruction, date intent opppositon before date instruction"} | ${DossierState.EnInstruction}         | ${faker.date.future(1, "2020-01-01")}               | ${null}                                                | ${null}                             | ${null}                                                | ${null}                                                | ${null}                                                | ${faker.date.past(1, "2020-01-01")}
    ${"In instruction, date intent opppositon before date prorogation"} | ${DossierState.EnInstruction}         | ${faker.date.past(1, "2020-01-01")}                 | ${null}                                                | ${null}                             | ${null}                                                | ${null}                                                | ${faker.date.future(1, "2020-03-01")}                  | ${faker.date.between("2020-01-01", "2020-03-01")}
  `(
    "cas $cas: Should throw error check of validities of dates",
    ({
      state,
      dateInstrution,
      firstDemand,
      firstReceip,
      secondDemand,
      secondReceip,
      dateProrogation,
      dateIntentOppo,
    }) => {
      const dossier: DossierDS = new DossierDS();
      dossier.dataJson = {};
      dossier.dataJson.state = state;
      dossier.dataJson.datePassageEnInstruction = dateInstrution;
      const instuctionTimes = {
        [keyInstructionTime.DATE_REQUEST1]: firstDemand,
        [keyInstructionTime.DATE_RECEIPT1]: firstReceip,
        [keyInstructionTime.BEGIN_PROROGATION_DATE]: dateProrogation,
        [keyInstructionTime.DATE_REQUEST2]: secondDemand,
        [keyInstructionTime.DATE_RECEIPT2]: secondReceip,
        [keyInstructionTime.DATE_INTENT_OPPOSITION]: dateIntentOppo,
      };
      const result = () =>
        service.checkValidity(dossier.dataJson, instuctionTimes);
      expect(result).toThrow("Erreur dans les déclarations de dates");
    },
  );
});
