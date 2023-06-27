import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";
import { DataSource } from "typeorm";
import { faker } from "@faker-js/faker/locale/fr";

import { InstructionTimesService } from "./instruction_times.service";
import configuration from "../../../config/configuration";
import instructionTimeMappingConfig, {
  keyInstructionTime,
} from "../config/instructionTimeMapping.config";
import { InstructionTime } from "../entities";
import { DossierDS } from "../../../modules/dossiers/entities/dossier_ds.entity";
import MockDate from "mockdate";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";

describe("InstructionTimesService, Check Date", () => {
  let service: InstructionTimesService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync(typeormFactoryLoader),
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, instructionTimeMappingConfig],
        }),
      ],
      providers: [InstructionTimesService],
    }).compile();

    service = module.get<InstructionTimesService>(InstructionTimesService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    MockDate.reset();
    await InstructionTime.delete({});
  });
  afterAll(async () => {
    await dataSource.destroy();
  });

  const fakerDossierInConstructionOrClos = (): DossierState =>
    faker.helpers.arrayElement([
      DossierState.EnConstruction,
      DossierState.Accepte,
      DossierState.Refuse,
      DossierState.SansSuite,
    ]);

  const fakerDossierClosed = (): DossierState =>
    faker.helpers.arrayElement([
      DossierState.Accepte,
      DossierState.Refuse,
      DossierState.SansSuite,
    ]);

  const fakerDateOrNull = (date): Date | null =>
    faker.helpers.arrayElement([date, null]);

  type DateOfDossierToCheck = {
    state: DossierState | null;
    dateInstrution: Date | string | null;
    firstDemand: Date | null;
    firstReceip: Date | null;
    dateProrogation: Date | null;
    secondDemand: Date | null;
    secondReceip: Date | null;
    dateIntentOppo: Date | null;
  };

  function forTestValidity(argTocheck: DateOfDossierToCheck): boolean {
    const {
      state,
      dateInstrution,
      firstDemand,
      firstReceip,
      dateProrogation,
      secondDemand,
      secondReceip,
      dateIntentOppo,
    } = argTocheck;
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
    return service.checkValidity(dossier.dataJson, instuctionTimes);
  }

  it("In building: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: fakerDossierInConstructionOrClos(),
        dateInstrution: null,
        firstDemand: null,
        firstReceip: null,
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      }),
    ).toBe(true);
  });

  it("In building with 1st Demand: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: fakerDossierInConstructionOrClos(),
        dateInstrution: faker.date.past().toISOString(),
        firstDemand: fakerDateOrNull(faker.date.past(1, "2020-01-01")),
        firstReceip: null,
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      }),
    ).toBe(true);
  });

  it("In closed with all dates: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: fakerDossierClosed(),
        dateInstrution: faker.date.past().toISOString(),
        firstDemand: faker.date.past(1, "2020-01-01"),
        firstReceip: faker.date.between("2020-01-01", "2020-02-01"),
        dateProrogation: fakerDateOrNull(faker.date.past()),
        secondDemand: fakerDateOrNull(faker.date.past()),
        secondReceip: fakerDateOrNull(faker.date.past()),
        dateIntentOppo: null,
      }),
    ).toBe(true);
  });

  it("In instruction with receip of 1st Demand: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date.future(1, "2020-02-01").toISOString(),
        firstDemand: faker.date.past(1, "2020-01-01"),
        firstReceip: faker.date.between("2020-01-01", "2020-02-01"),
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      }),
    ).toBe(true);
  });

  it("In instruction with all dates: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-02-01", "2020-03-01")
          .toISOString(),
        firstDemand: faker.date.past(1, "2020-01-01"),
        firstReceip: faker.date.between("2020-01-01", "2020-02-01"),
        dateProrogation: faker.date.between("2020-02-01", "2020-03-01"),
        secondDemand: faker.date.between("2020-04-01", "2020-05-01"),
        secondReceip: fakerDateOrNull(
          faker.date.between("2020-05-01", "2020-06-01"),
        ),
        dateIntentOppo: null,
      }),
    ).toBe(true);
  });

  it("In instruction without the dates of 1st Demand: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-01-01", "2020-02-01")
          .toISOString(),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: faker.date.between("2020-02-01", "2020-03-01"),
        secondDemand: faker.date.between("2020-03-01", "2020-04-01"),
        secondReceip: fakerDateOrNull(
          faker.date.between("2020-04-01", "2020-05-01"),
        ),
        dateIntentOppo: null,
      }),
    ).toBe(true);
  });

  it("In instruction with the date extension only: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-01-01", "2020-02-01")
          .toISOString(),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: faker.date.between("2020-02-01", "2020-03-01"),
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      }),
    ).toBe(true);
  });

  it("In instruction with the date intent opppositon: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-01-01", "2020-02-01")
          .toISOString(),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: fakerDateOrNull(
          faker.date.between("2020-02-01", "2020-03-01"),
        ),
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: faker.date.future(1, "2020-03-01"),
      }),
    ).toBe(true);
  });

  it("In instruction with the dates is same days: Should check of validities of date", () => {
    expect(
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: new Date("2020-01-01T14:00:00"),
        firstDemand: new Date("2020-01-01T15:00:00"),
        firstReceip: new Date("2020-01-01T15:30:00"),
        dateProrogation: new Date("2020-01-01T16:00:00"),
        secondDemand: new Date("2020-01-01T17:00:00"),
        secondReceip: new Date("2020-01-01T17:30:00"),
        dateIntentOppo: new Date("2020-01-01T18:00:00"),
      }),
    ).toBe(true);
  });

  it("cas In closed with 1st demande after 1st receipt: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: fakerDossierClosed(),
        dateInstrution: fakerDateOrNull(faker.date.past().toISOString()),
        firstDemand: faker.date.future(1, "2020-01-01"),
        firstReceip: faker.date.past(1, "2020-01-01"),
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "La date de réception de pièces est plus ancienne que La date de demande de pièces",
    );
  });
  it("cas In instruction with 1st demande after 1st receipt: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: fakerDateOrNull(faker.date.past().toISOString()),
        firstDemand: faker.date.future(1, "2020-01-01"),
        firstReceip: faker.date.past(1, "2020-01-01"),
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "La date de réception de pièces est plus ancienne que La date de demande de pièces",
    );
  });

  it("cas In instruction, without 1st demand and with 1st receipt: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: fakerDateOrNull(faker.date.past().toISOString()),
        firstDemand: null,
        firstReceip: faker.date.past(1, "2020-01-01"),
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow("La date de demande de pièces est manaquante");
  });
  it("cas In building with 1st demande and 1st receipt: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnConstruction,
        dateInstrution: null,
        firstDemand: fakerDateOrNull(faker.date.past(1, "2020-01-01")),
        firstReceip: faker.date.future(1, "2020-01-01"),
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "Ce dossier est en construction et posséde une date de récéption de 1er demande de piéce",
    );
  });

  it("cas In instruction without receipt of 1st demande: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date.past().toISOString(),
        firstDemand: faker.date.past(1, "2020-01-01"),
        firstReceip: null,
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "La date de reception de la 1ere demande est manquante",
    );
  });

  it("cas In instruction with receipt of 1st demande after instruction: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-01-01", "2020-03-01")
          .toISOString(),
        firstDemand: faker.date.past(1, "2020-01-01"),
        firstReceip: faker.date.future(1, "2020-03-01"),
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "La date d'instruction est plus ancienne que La date de réception de pièces",
    );
  });

  it("cas In instruction undated: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: null,
        firstDemand: null,
        firstReceip: null,
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow("La date d'instruction est manquante");
  });

  it("cas In instruction, prorogation before instruction date: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date.future(1, "2020-01-01"),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: faker.date.past(1, "2020-01-01"),
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "La date de prorogation est plus ancienne que La date d'instruction",
    );
  });
  it("cas In instruction, without prorogation and with 2nd demand: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-01-01", "2020-01-15")
          .toISOString(),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: null,
        secondDemand: faker.date.between("2020-01-15", "2020-02-01"),
        secondReceip: fakerDateOrNull(faker.date.future(1, "2020-03-01")),
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow("La date de prorogation est manaquante");
  });

  it("cas In instruction, prorogation after 2nd demand: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-01-01", "2020-01-15")
          .toISOString(),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: faker.date.between("2020-02-01", "2020-03-01"),
        secondDemand: faker.date.between("2020-01-15", "2020-02-01"),
        secondReceip: fakerDateOrNull(faker.date.future(1, "2020-03-01")),
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "La date de demande de pièces est plus ancienne que La date de prorogation",
    );
  });
  it("cas In instruction, 2nd demand after 2nd receipt date: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date.past(1, "2020-01-01"),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: null,
        secondDemand: faker.date.future(1, "2020-01-01"),
        secondReceip: faker.date.past(1, "2020-01-01"),
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "La date de reception de pièces est plus ancienne que La date de demande de pièces",
    );
  });

  it("cas In instruction, without 2nd demand and with 2nd receipt date: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date.past(1, "2020-01-01"),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: null,
        secondDemand: null,
        secondReceip: faker.date.past(1, "2020-01-01"),
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow("La date de demande de pièces est manaquante");
  });
  it("cas In instruction, date intent opppositon before date instruction: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date.future(1, "2020-01-01"),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: null,
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: faker.date.past(1, "2020-01-01"),
      });
    };

    expect(result).toThrow(
      "La date d'intention opposition est plus ancienne que La date d'instruction",
    );
  });
  it("cas In instruction, date intent opppositon before date prorogation: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-01-01", "2020-01-05")
          .toISOString(),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: faker.date.between("2020-01-20", "2020-02-01"),
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: faker.date.between("2020-01-10", "2020-01-20"),
      });
    };

    expect(result).toThrow(
      "La date d'intention opposition est plus ancienne que La date de prorogation",
    );
  });

  it("cas In instruction, prorogation after 60 days of the instruction date: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date.past(1, "2020-01-01").toISOString(),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: faker.date.future(1, "2020-03-01"),
        secondDemand: null,
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "Elle est aprés 60 jours par rapport à la date d'instruction",
    );
  });
  it("cas In instruction, 2nd demand after 180 days of the instruction date: Should throw error check of validities of dates", () => {
    const result = (): void => {
      forTestValidity({
        state: DossierState.EnInstruction,
        dateInstrution: faker.date
          .between("2020-01-01", "2020-02-01")
          .toISOString(),
        firstDemand: null,
        firstReceip: null,
        dateProrogation: faker.date.between("2020-02-01", "2020-03-01"),
        secondDemand: faker.date.future(1, "2020-07-31"),
        secondReceip: null,
        dateIntentOppo: null,
      });
    };

    expect(result).toThrow(
      "Elle est aprés 180 jours par rapport à la date d'instruction",
    );
  });
});
