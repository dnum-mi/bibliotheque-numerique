import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { DataSource } from "typeorm";
import { faker } from "@faker-js/faker/locale/fr";

import { InstructionTimesService } from "./instruction_times.service";
import configuration from "../../../config/configuration";
import instructionTimeMappingConfig, {
  TInstructionTimeMappingConfig,
  keyInstructionTime,
} from "../config/instructionTimeMapping.config";
import {
  datasourceTest,
  dossier_ds_test,
  dossier_test,
} from "../../../entities/__tests__";
import { InstructionTime } from "../entities";
import { Demarche, DemarcheDS, Dossier, DossierDS } from "../../../entities";
import { EInstructionTimeState } from "../types/IntructionTime.type";
import { type } from "os";

describe("InstructionTimesService", () => {
  let service: InstructionTimesService;
  let configService: ConfigService;
  let dataSource: DataSource;
  let instructionTimeMappingConfigFound: TInstructionTimeMappingConfig["instructionTimeMappingConfig"];
  const dataTestInstructionTime = [];

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

    instructionTimeMappingConfigFound = configService.get<
      TInstructionTimeMappingConfig["instructionTimeMappingConfig"]
    >("instructionTimeMappingConfig");
  });

  afterEach(async () => {
    await InstructionTime.delete({});
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

    fakeDossier.dossierDS.dataJson.annotations = [
      {
        id: faker.datatype.uuid(),
        date: "2021-02-01",
        label: instructionTimeMappingConfigFound.DateReceipt1,
      },
      {
        id: faker.datatype.uuid(),
        date: "2021-04-02",
        label: instructionTimeMappingConfigFound.DateReceipt2,
      },
      {
        id: faker.datatype.uuid(),
        date: "2021-01-01",
        label: instructionTimeMappingConfigFound.DateRequest1,
      },
      {
        id: faker.datatype.uuid(),
        date: "2021-03-15",
        label: instructionTimeMappingConfigFound.DateRequest2,
      },
      {
        id: faker.datatype.uuid(),
        datetime: "2021-07-01T00:00:00.000Z",
        label: instructionTimeMappingConfigFound.DurationExtension,
      },
      {
        id: faker.datatype.uuid(),
        date: "2021-03-15",
        label: instructionTimeMappingConfigFound.DateIntentOpposition,
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
      DateIntentOpposition: new Date("2021-03-15T00:00:00.000Z"),
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
  const jrsInMillisecond = 24 * 60 * 60 * 1000;

  function getDataTestInstructionTime(idx) {
    const datas = {
      //2
      ["In closure"]: {
        expected: {},
        dossier: {
          state: DossierState.Accepte,
        },
      },
      //3
      ["In building"]: {
        expected: {},
        dossier: {
          state: DossierState.EnConstruction,
        },
      },
      //4
      ["In first demand"]: {
        expected: {
          state: EInstructionTimeState.FIRST_REQUEST,
        },
        dossier: {
          state: DossierState.EnConstruction,
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //5
      ["In first demand 2"]: {
        expected: {
          state: EInstructionTimeState.FIRST_REQUEST,
        },
        dossier: {
          state: DossierState.EnConstruction,
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: "2023-01-05",
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //6
      ["In instruction"]: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 59,
          now: "2023-01-06",
          endAt: new Date(
            new Date("2023-01-06").getTime() + 59 * jrsInMillisecond,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-05",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: "2023-01-05",
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //7
      ["In instruction 2"]: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 60,
          now: "2023-01-06",
          endAt: new Date(
            new Date("2023-01-06").getTime() + 60 * jrsInMillisecond,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: "2023-01-05",
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //8
      ["In instruction, out of date"]: {
        expected: {
          state: EInstructionTimeState.OUT_OF_DATE,
          delay: undefined,
          now: "2023-03-09",
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: "2023-01-05",
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //9
      ["In extention"]: {
        expected: {
          state: EInstructionTimeState.IN_EXTENSION,
          delay: 166,
          now: "2023-01-20",
          endAt: new Date(
            new Date("2023-01-20").getTime() + 166 * jrsInMillisecond,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //10
      ["In extention, out of date"]: {
        expected: {
          state: EInstructionTimeState.OUT_OF_DATE,
          delay: 166,
          now: "2023-07-06",
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //11
      ["In second demand"]: {
        expected: {
          state: EInstructionTimeState.SECOND_REQUEST,
          delay: 164,
          now: "2023-01-22",
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              date: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              date: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //12
      ["In second demand 2"]: {
        expected: {
          state: EInstructionTimeState.SECOND_REQUEST,
          delay: 164,
          now: "2023-01-24",
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //13
      ["In second reciept"]: {
        expected: {
          state: EInstructionTimeState.SECOND_RECEIPT,
          delay: 164,
          now: "2023-01-25",
          endAt: new Date(
            new Date("2023-01-25").getTime() + 164 * jrsInMillisecond,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //14
      ["In second reciept 2"]: {
        expected: {
          state: EInstructionTimeState.SECOND_RECEIPT,
          delay: 163,
          now: "2023-01-26",
          endAt: new Date(
            new Date("2023-01-26").getTime() + 163 * jrsInMillisecond,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //15
      ["In second reciept, out of date"]: {
        expected: {
          state: EInstructionTimeState.OUT_OF_DATE,
          now: "2023-07-10",
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      //16
      ["In opposition"]: {
        expected: {
          state: EInstructionTimeState.INTENT_OPPO,
          // now: "2023-07-10",
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.datatype.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.datatype.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.datatype.uuid(),
              date: "2023-01-28",
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
    };
    return datas[idx];
  }

  it.each`
    cas
    ${"In closure"}
    ${"In building"}
    ${"In first demand"}
    ${"In first demand 2"}
    ${"In instruction"}
    ${"In instruction 2"}
    ${"In instruction, out of date"}
    ${"In extention"}
    ${"In extention, out of date"}
    ${"In second demand"}
    ${"In second demand 2"}
    ${"In second reciept"}
    ${"In second reciept 2"}
    ${"In second reciept, out of date"}
    ${"In opposition"}
  `(
    "cas $cas: Should create ou update of instruction time",
    async ({ cas }) => {
      const data = getDataTestInstructionTime(cas);

      const instructionTime = new InstructionTime();
      instructionTime.dossier = new Dossier();
      instructionTime.dossier.dossierDS = new DossierDS();
      instructionTime.dossier.dossierDS.dataJson = data.dossier;

      jest
        .spyOn(Date, "now")
        .mockReturnValue(new Date(data.expected.now).getTime());
      const result = await service.proccess(instructionTime);
      expect(result).toHaveProperty("state", data.expected.state || null);

      if (
        typeof result !== "boolean" &&
        [
          EInstructionTimeState.IN_PROGRESS,
          EInstructionTimeState.IN_EXTENSION,
        ].includes(data.expected.state)
      ) {
        const recieveDelay =
          (result?.endAt?.getTime() - new Date(data.expected.now).getTime()) /
          jrsInMillisecond;
        expect(recieveDelay).toBe(data.expected.delay);
      }
    },
  );
});
