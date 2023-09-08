/* eslint-disable */
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";
import { faker } from "@faker-js/faker/locale/fr";

import dayjs from "../../../shared/utils/dayjs";

import { InstructionTimesService } from "./instruction_times.service";
import configuration from "../../../config/configuration";
import instructionTimeMappingConfig, {
  TInstructionTimeMappingConfig,
} from "../config/instructionTimeMapping.config";
import { EInstructionTimeState } from "./types/IntructionTime.type";
import { Dossier } from "../../../modules/dossiers/objects/entities/dossier.entity";
import MockDate from "mockdate";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";
import { InstructionTime } from "./instruction_time.entity";
import { getFakeDossierTest } from "../../../../test/unit/fake-data/dossier.fake-data";
import { DossierService } from "../../../modules/dossiers/providers/dossier.service";
import { DossierModule } from "../../../modules/dossiers/dossier.module";
import fileConfig from "../../../config/file.config";
import dsConfig from "../../../config/ds.config";
import { DsApiModule } from "../../../shared/modules/ds-api/ds-api.module";
import { FieldService } from "../../../modules/dossiers/providers/field.service";
import { Field } from "../../../modules/dossiers/objects/entities/field.entity";
import { fixFieldInstructionTimeDelay, fixFieldInstructionTimeStatus } from "./constante/fix-field-instrucation-times.dictionnary";

describe("InstructionTimesService", () => {
  let service: InstructionTimesService;
  let dossierService: DossierService;
  let configService: ConfigService;
  let instructionTimeMappingConfigFound: TInstructionTimeMappingConfig["instructionTimeMappingConfig"];
  let fieldService: FieldService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // TODO: typeorm should not be imported for unit test, neither should it be imported twice for connection and injection
        TypeOrmModule.forRootAsync(typeormFactoryLoader),
        TypeOrmModule.forFeature([InstructionTime, Dossier]),
        DossierModule,
        DsApiModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, dsConfig, fileConfig, instructionTimeMappingConfig],
        }),

      ],
      providers: [InstructionTimesService],
    }).useMocker(() => ({})).compile();

    service = module.get<InstructionTimesService>(InstructionTimesService);
    dossierService = module.get<DossierService>(DossierService);
    configService = module.get<ConfigService>(ConfigService);
    fieldService = module.get<FieldService>(FieldService);

    instructionTimeMappingConfigFound = configService.get<
      TInstructionTimeMappingConfig["instructionTimeMappingConfig"]
    >("instructionTimeMappingConfig");
  });

  afterEach(async () => {
    await service.repository.delete({})
    MockDate.reset()
    jest.clearAllMocks()
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("It should return good annotations", async () => {
    const fakeDossier = getFakeDossierTest(null);
    jest
      .spyOn(dossierService, "findOneById")
      .mockResolvedValueOnce(fakeDossier as Dossier);

    fakeDossier.dsDataJson.annotations = [
      {
        id: faker.string.uuid(),
        date: "2021-02-01",
        label: instructionTimeMappingConfigFound.DateReceipt1,
      },
      {
        id: faker.string.uuid(),
        date: "2021-04-02",
        label: instructionTimeMappingConfigFound.DateReceipt2,
      },
      {
        id: faker.string.uuid(),
        date: "2021-01-01",
        label: instructionTimeMappingConfigFound.DateRequest1,
      },
      {
        id: faker.string.uuid(),
        date: "2021-03-15",
        label: instructionTimeMappingConfigFound.DateRequest2,
      },
      {
        id: faker.string.uuid(),
        datetime: "2021-07-01T00:00:00.000Z",
        label: instructionTimeMappingConfigFound.DurationExtension,
      },
      {
        id: faker.string.uuid(),
        date: "2021-03-15",
        label: instructionTimeMappingConfigFound.DateIntentOpposition,
      },
    ] as any;

    expect(
      await service.getMappingInstructionTimeByDossierId(fakeDossier.id),
    ).toEqual({
      BeginProrogationDate: null,
      DateReceipt1: dayjs("2021-02-01T00:00:00.000Z").startOf("day").toDate(),
      DateReceipt2: dayjs("2021-04-02T00:00:00.000Z").startOf("day").toDate(),
      DateRequest1: dayjs("2021-01-01T00:00:00.000Z").startOf("day").toDate(),
      DateRequest2: dayjs("2021-03-15T00:00:00.000Z").startOf("day").toDate(),
      DurationExtension: dayjs("2021-07-01T00:00:00.000Z")
        .startOf("day")
        .toDate(),
      DateIntentOpposition: dayjs("2021-03-15T00:00:00.000Z")
        .startOf("day")
        .toDate(),
    });
  });

  it("It should return good times instruction for a list a dossiers", async () => {
    const instructionTimeMappingConfig = configService.get<
      TInstructionTimeMappingConfig["instructionTimeMappingConfig"]
    >("instructionTimeMappingConfig");

    const fakeInstrunctionTime: Partial<InstructionTime>[] = Array.from(
      { length: 3 },
      (elt, idx) => {
        const dossier = getFakeDossierTest(null);
        dossier.id = idx + 1;

        if (dossier.id === 2) {
          dossier.dsDataJson.state = DossierState.EnConstruction;
          dossier.dsDataJson.annotations = [
            {
              id: faker.string.uuid(),
              date: "2021-02-01",
              label: instructionTimeMappingConfig.DateRequest1,
            },
          ] as any;

          return {
            dossier,
            state: EInstructionTimeState.FIRST_REQUEST,
          } as InstructionTime;
        }
        return {
          dossier,
        } as InstructionTime;
      },
    );

    const results = {}
    const mockUpsert = jest
      .spyOn(fieldService, 'upsert')
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    jest
      .spyOn(service.repository, "find")
      .mockResolvedValueOnce(fakeInstrunctionTime as InstructionTime[]);

    await service.instructionTimeCalculation(
      fakeInstrunctionTime.map((d) => d.dossier.id),
    )

    expect(mockUpsert).toBeCalledTimes(1)


    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeStatus.id,
      dossierId: 2,
      stringValue: EInstructionTimeState.FIRST_REQUEST,
      label: fixFieldInstructionTimeStatus.originalLabel,
      type: fixFieldInstructionTimeStatus.type,
      fieldSource: fixFieldInstructionTimeStatus.source,
    })
  });

  const millisecondsOfDay = 24 * 60 * 60 * 1000;

  function getDataTestInstructionTime(idx) {
    const datas = {
      ["In closure"]: {
        expected: {
          state: EInstructionTimeState.DEFAULT,
        },
        dossier: {
          state: DossierState.Accepte,
        },
      },

      ["In building"]: {
        expected: {
          state: EInstructionTimeState.DEFAULT,
        },
        dossier: {
          state: DossierState.EnConstruction,
        },
      },

      ["In first demand"]: {
        expected: {
          state: EInstructionTimeState.FIRST_REQUEST,
        },
        dossier: {
          state: DossierState.EnConstruction,
          annotations: [
            {
              id: faker.string.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

      ["In instruction without 1st demand"]: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 60,
          now: "2023-01-01",
          endAt: new Date(
            new Date("2023-01-01").getTime() + 60 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-01",
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      ["In instruction without 1st demand next day"]: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 55,
          now: "2023-01-06",
          endAt: new Date(
            new Date("2023-01-01").getTime() + 60 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-01",
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },
      ["In instruction"]: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 59,
          now: "2023-01-06",
          endAt: new Date(
            new Date("2023-01-05").getTime() + 60 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-05",
          annotations: [
            {
              id: faker.string.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: "2023-01-05",
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

      ["In instruction 2"]: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 59,
          now: "2023-01-06",
          endAt: new Date(
            new Date("2023-01-05").getTime() + 60 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.string.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: "2023-01-05",
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

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
              id: faker.string.uuid(),
              date: "2023-01-01",
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: "2023-01-05",
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

      ["In extention"]: {
        expected: {
          state: EInstructionTimeState.IN_EXTENSION,
          delay: 166,
          now: "2023-01-20",
          endAt: new Date(
            new Date("2023-01-06").getTime() + 180 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

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
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

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
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              date: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              date: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

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
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

      ["In second reciept"]: {
        expected: {
          state: EInstructionTimeState.SECOND_RECEIPT,
          delay: 164,
          now: "2023-01-25",
          endAt: new Date(
            new Date("2023-01-25").getTime() + 164 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

      ["In second reciept 2"]: {
        expected: {
          state: EInstructionTimeState.SECOND_RECEIPT,
          delay: 163,
          now: "2023-01-26",
          endAt: new Date(
            new Date("2023-01-26").getTime() + 163 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

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
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

      ["In opposition"]: {
        expected: {
          state: EInstructionTimeState.INTENT_OPPO,
          // now: "2023-07-10",
          delay: 30,
          now: "2023-01-28",
          endAt: new Date(
            new Date("2023-01-28").getTime() + 30 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
              date: "2023-01-28",
              label: instructionTimeMappingConfigFound.DateIntentOpposition,
            },
          ],
        },
      },

      ["In opposition in out of date"]: {
        expected: {
          state: EInstructionTimeState.INTENT_OPPO,
          // now: "2023-07-10",
          delay: -2,
          now: "2023-03-01",
          endAt: new Date(
            new Date("2023-01-28").getTime() + 30 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: "2023-01-06",
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateRequest1,
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigFound.DateReceipt1,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-20",
              label: instructionTimeMappingConfigFound.BeginProrogationDate,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-22",
              label: instructionTimeMappingConfigFound.DateRequest2,
            },
            {
              id: faker.string.uuid(),
              datetime: "2023-01-25",
              label: instructionTimeMappingConfigFound.DateReceipt2,
            },
            {
              id: faker.string.uuid(),
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
    ${"In instruction without 1st demand"}
    ${"In instruction without 1st demand next day"}
    ${"In opposition in out of date"}
  `(
    "cas $cas: Should create ou update of instruction time",
    async ({ cas }) => {
      const data = getDataTestInstructionTime(cas);

      const instructionTime = new InstructionTime();
      instructionTime.dossier = new Dossier();
      instructionTime.dossier.dsDataJson = getFakeDossierTest(null).dsDataJson;
      instructionTime.dossier.dsDataJson = data.dossier;
      if (data.expected.now) {
        MockDate.set(data.expected.now);
      }
      const result = await service.proccess(instructionTime);
      expect(result).toHaveProperty(
        "state",
        data.expected.state || EInstructionTimeState.DEFAULT,
      );

      if (
        typeof result !== "boolean" &&
        [
          EInstructionTimeState.IN_PROGRESS,
          EInstructionTimeState.IN_EXTENSION,
          EInstructionTimeState.INTENT_OPPO,
        ].includes(data.expected.state)
      ) {
        const recieveDelay = dayjs(result?.endAt).diff(
          data.expected.now,
          "day",
        );
        expect(recieveDelay).toBe(data.expected.delay);
      }
    },
  );

  it("Should get delay 60 for date now when is in progress", async () => {
    const dataInstructionTime = new InstructionTime();

    dataInstructionTime.startAt = new Date();
    dataInstructionTime.endAt = dayjs(new Date()).add(60, "day").toDate();
    dataInstructionTime.dossier = { id: 1 } as Dossier;
    dataInstructionTime.state = EInstructionTimeState.IN_PROGRESS;
    jest
      .spyOn(service.repository, "find")
      .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[]);

    const results = {}
    const mockUpsert = jest
      .spyOn(fieldService, 'upsert')
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    await service.instructionTimeCalculation([
      dataInstructionTime.dossier.id,
    ]);

    expect(mockUpsert).toBeCalledTimes(2)

    expect(results[fixFieldInstructionTimeDelay.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeDelay.id,
        dossierId: dataInstructionTime.dossier.id,
        numberValue: 60,
        label: fixFieldInstructionTimeDelay.originalLabel,
        type: fixFieldInstructionTimeDelay.type,
        fieldSource: fixFieldInstructionTimeDelay.source,
    })
    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeStatus.id,
        dossierId: dataInstructionTime.dossier.id,
        stringValue: EInstructionTimeState.IN_PROGRESS,
        label: fixFieldInstructionTimeStatus.originalLabel,
        type: fixFieldInstructionTimeStatus.type,
        fieldSource: fixFieldInstructionTimeStatus.source,
      })
  });

  it("Should get out delay for date now when is in progress", async () => {
    const dataInstructionTime = new InstructionTime();

    dataInstructionTime.startAt = new Date();
    dataInstructionTime.endAt = dayjs(new Date()).subtract(1, "day").toDate();
    dataInstructionTime.dossier = { id: 1 } as Dossier;
    dataInstructionTime.state = EInstructionTimeState.IN_PROGRESS;
    jest
      .spyOn(service.repository, "find")
      .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[]);

    const results = {}
    const mockUpsert = jest
      .spyOn(fieldService, 'upsert')
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    await service.instructionTimeCalculation([
      dataInstructionTime.dossier.id,
    ]);

    expect(mockUpsert).toBeCalledTimes(1)

    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeStatus.id,
        dossierId: dataInstructionTime.dossier.id,
        stringValue: EInstructionTimeState.OUT_OF_DATE,
        label: fixFieldInstructionTimeStatus.originalLabel,
        type: fixFieldInstructionTimeStatus.type,
        fieldSource: fixFieldInstructionTimeStatus.source,
      })
  });

  it("Should get stop delay for date now when is in 2nd demand", async () => {
    const dataInstructionTime = new InstructionTime();

    dataInstructionTime.startAt = new Date();
    dataInstructionTime.stopAt = dayjs(dataInstructionTime.stopAt)
      .add(5, "day")
      .toDate();
    dataInstructionTime.endAt = dayjs(dataInstructionTime.stopAt)
      .add(20, "day")
      .toDate();
    dataInstructionTime.dossier = { id: 1 } as Dossier;
    dataInstructionTime.state = EInstructionTimeState.SECOND_REQUEST;

    jest
      .spyOn(service.repository, "find")
      .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[]);


    const results = {}
    const mockUpsert = jest
      .spyOn(fieldService, 'upsert')
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    const result = await service.instructionTimeCalculation([
      dataInstructionTime.dossier.id,
    ]);

    expect(mockUpsert).toBeCalledTimes(2)

    expect(results[fixFieldInstructionTimeDelay.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeDelay.id,
        dossierId: dataInstructionTime.dossier.id,
        numberValue: 20,
        label: fixFieldInstructionTimeDelay.originalLabel,
        type: fixFieldInstructionTimeDelay.type,
        fieldSource: fixFieldInstructionTimeDelay.source,
    })
    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeStatus.id,
        dossierId: dataInstructionTime.dossier.id,
        stringValue: EInstructionTimeState.SECOND_REQUEST,
        label: fixFieldInstructionTimeStatus.originalLabel,
        type: fixFieldInstructionTimeStatus.type,
        fieldSource: fixFieldInstructionTimeStatus.source,
      })
  });

  it("Should get delay to 20 for date now when is in intent opposition", async () => {
    const dataInstructionTime = new InstructionTime();

    dataInstructionTime.startAt = new Date();
    dataInstructionTime.endAt = dayjs().add(20, "day").toDate();
    dataInstructionTime.dossier = { id: 1 } as Dossier;
    dataInstructionTime.state = EInstructionTimeState.INTENT_OPPO;

    const results = {}
    const mockUpsert = jest
      .spyOn(fieldService, 'upsert')
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    jest
      .spyOn(service.repository, "find")
      .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[]);

    await service.instructionTimeCalculation([
      dataInstructionTime.dossier.id,
    ]);

    expect(mockUpsert).toBeCalledTimes(2)

    expect(results[fixFieldInstructionTimeDelay.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeDelay.id,
        dossierId: dataInstructionTime.dossier.id,
        numberValue: 20,
        label: fixFieldInstructionTimeDelay.originalLabel,
        type: fixFieldInstructionTimeDelay.type,
        fieldSource: fixFieldInstructionTimeDelay.source,
    })
    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeStatus.id,
        dossierId: dataInstructionTime.dossier.id,
        stringValue: EInstructionTimeState.INTENT_OPPO,
        label: fixFieldInstructionTimeStatus.originalLabel,
        type: fixFieldInstructionTimeStatus.type,
        fieldSource: fixFieldInstructionTimeStatus.source,
      })

  });

  it("Should get delay to 0 for date now when the date of intent opposition is more 30 days  ", async () => {
    const dataInstructionTime = new InstructionTime();

    dataInstructionTime.startAt = new Date();
    dataInstructionTime.endAt = dayjs().add(-1, "day").toDate();
    dataInstructionTime.dossier = { id: 1 } as Dossier;
    dataInstructionTime.state = EInstructionTimeState.INTENT_OPPO;

    jest
    .spyOn(service.repository, "find")
    .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[]);

    const results = {}
    const mockUpsert = jest
      .spyOn(fieldService, 'upsert')
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    await service.instructionTimeCalculation([
      dataInstructionTime.dossier.id,
    ])
    expect(mockUpsert).toBeCalledTimes(2)

    expect(results[fixFieldInstructionTimeDelay.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeDelay.id,
        dossierId: dataInstructionTime.dossier.id,
        numberValue: 0,
        label: fixFieldInstructionTimeDelay.originalLabel,
        type: fixFieldInstructionTimeDelay.type,
        fieldSource: fixFieldInstructionTimeDelay.source,
    })
    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
        sourceId: fixFieldInstructionTimeStatus.id,
        dossierId: dataInstructionTime.dossier.id,
        stringValue: EInstructionTimeState.INTENT_OPPO,
        label: fixFieldInstructionTimeStatus.originalLabel,
        type: fixFieldInstructionTimeStatus.type,
        fieldSource: fixFieldInstructionTimeStatus.source,
      })
  });

});
