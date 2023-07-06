import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";
import { In, Repository } from "typeorm";

import dayjs, { type Dayjs } from "../../../shared/utils/dayjs";

import { LoggerService } from "../../../shared/modules/logger/logger.service";
import {
  TInstructionTimeMappingConfig,
  keyInstructionTime,
} from "../config/instructionTimeMapping.config";
import {
  EInstructionTimeState,
  EInstructionTimeStateKey,
} from "./types/IntructionTime.type";
import { Dossier } from "../../../modules/dossiers/entities/dossier.entity";
import { InstructionTime } from "./instruction_time.entity";
import { BaseEntityService } from "../../../shared/base-entity/base-entity.service";
import { InjectRepository } from "@nestjs/typeorm";
import { DossiersService } from "../../../modules/dossiers/providers/dossiers.service";

type TIntructionTime = {
  [keyInstructionTime.DATE_REQUEST1]?: Date | null;
  [keyInstructionTime.DATE_RECEIPT1]?: Date | null;
  [keyInstructionTime.BEGIN_PROROGATION_DATE]?: Date | null;
  [keyInstructionTime.DURATION_EXTENSION]?: Date | null;
  [keyInstructionTime.DATE_REQUEST2]?: Date | null;
  [keyInstructionTime.DATE_RECEIPT2]?: Date | null;
  [keyInstructionTime.DATE_INTENT_OPPOSITION]?: Date | null;
};

type TDelay = {
  endAt: Dayjs;
  startAt: Dayjs;
  stopAt: Dayjs;
  state: EInstructionTimeStateKey;
  isStop: boolean;
};

type toCheckDate = { date: Date | undefined | null; message: string };

@Injectable()
export class InstructionTimesService extends BaseEntityService<InstructionTime> {
  nbDaysAfterInstruction: number;
  nbDaysAfterExtension: number;
  nbDaysAfterIntentOpposition: number;
  millisecondsOfDay = 1000 * 60 * 60 * 24;

  constructor(
    private configService: ConfigService,
    protected readonly logger: LoggerService,
    private readonly dossierService: DossiersService,
    @InjectRepository(InstructionTime)
    protected readonly repo: Repository<InstructionTime>,
  ) {
    super(repo, logger);
    this.logger.setContext(this.constructor.name);
    this.nbDaysAfterInstruction = this.configService.get(
      "NB_DAYS_AFTER_INSTRUCTION",
    );
    this.nbDaysAfterExtension = this.configService.get(
      "NB_DAYS_AFTER_EXTENSION",
    );
    this.nbDaysAfterIntentOpposition = this.configService.get(
      "NB_DAYS_AFTER_INTENT_OPPOSITION",
    );
  }

  async findByDossierId(id: number): Promise<InstructionTime> {
    return this.repo.findOne({
      where: { dossier: { id } },
      relations: { dossier: true },
    });
  }

  findOne(id: number): Promise<InstructionTime> {
    return this.findOneById(id);
  }

  findOneByDossier(idDossier: number): Promise<InstructionTime> {
    return this.findByDossierId(idDossier);
  }

  getMappingInstructionTimeByDossier(dossier: Dossier): TIntructionTime {
    const instructionTimeMapping = this.configService.get<
      TInstructionTimeMappingConfig["instructionTimeMappingConfig"]
    >("instructionTimeMappingConfig");
    const annotations = dossier.dossierDS.dataJson.annotations;
    const result = {};
    for (const annotationLabelKey of Object.keys(instructionTimeMapping)) {
      const annotation = annotations?.find(
        (annotation) =>
          annotation.label === instructionTimeMapping[annotationLabelKey],
        // TODO: fixe type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;
      if (
        annotation &&
        (annotation.datetime || annotation.date || annotation.stringValue)
      ) {
        result[annotationLabelKey] = dayjs(
          annotation.datetime || annotation.date || annotation.stringValue,
        )
          .startOf("day")
          .toDate();
      } else {
        result[annotationLabelKey] = null;
      }
    }
    return result;
  }

  async getMappingInstructionTimeByDossierId(
    idDossier: number,
  ): Promise<TIntructionTime> {
    const dossier = await this.dossierService.findOneById(idDossier, {
      dossierDS: true,
    });
    return this.getMappingInstructionTimeByDossier(dossier);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async instructionTimeCalculation(idDossiers: number[]) {
    const instructionTimes = await this.repo.find({
      where: {
        dossier: {
          id: In(idDossiers),
        },
      },
      relations: { dossier: true },
    });

    // TODO: fixe type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return instructionTimes.reduce((acc: any, instructionTime) => {
      const { dossier } = instructionTime;
      let remainingTime = null;
      let delayStatus = null;
      if (
        [
          EInstructionTimeState.IN_EXTENSION,
          EInstructionTimeState.IN_PROGRESS,
          EInstructionTimeState.SECOND_RECEIPT as EInstructionTimeStateKey,
        ].includes(instructionTime.state)
      ) {
        remainingTime = dayjs(instructionTime.endAt)
          .startOf("day")
          .diff(dayjs().startOf("day"), "days");

        delayStatus =
          remainingTime > 0
            ? instructionTime.state
            : EInstructionTimeState.OUT_OF_DATE;
      }
      if (
        [
          EInstructionTimeState.SECOND_REQUEST as EInstructionTimeStateKey,
        ].includes(instructionTime.state)
      ) {
        const stopAt = dayjs(instructionTime.stopAt).startOf("day");
        remainingTime = dayjs(instructionTime.endAt)
          .startOf("day")
          .diff(stopAt, "days");
        delayStatus =
          remainingTime > 0
            ? instructionTime.state
            : EInstructionTimeState.OUT_OF_DATE;
      }

      if (instructionTime.state === EInstructionTimeState.INTENT_OPPO) {
        remainingTime = Math.max(
          0,
          dayjs(instructionTime.endAt)
            .startOf("day")
            .diff(dayjs().startOf("day"), "days"),
        );
      }

      acc[dossier.id] = {
        remainingTime: remainingTime != null ? Math.round(remainingTime) : null,
        delayStatus: delayStatus ?? instructionTime.state ?? null,
      };

      return acc;
    }, {});
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  checkAndGetLastDates(
    date1: toCheckDate,
    date2: toCheckDate,
    messageError: string,
  ): toCheckDate {
    const dateBefore = date1?.date;
    const dateAfter = date2?.date;
    if (dateAfter && !dateBefore) {
      throw new Error(
        `${messageError} ${
          date1?.message || "La premiére date"
        } est manaquante`,
      );
    }

    if (!dateBefore) return undefined;

    if (!dateAfter) return date1;

    if (dayjs(dateBefore).isSameOrBefore(dateAfter, "days")) {
      return date1;
    }

    throw new Error(
      `${messageError} ${
        date2?.message || "la seconde date"
      } est plus ancienne que ${date1?.message || "le première date"}`,
    );
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  checkValidity(data: Partial<TDossier>, instructionTime: TIntructionTime) {
    const messageError = `Erreur dans les déclarations de dates pour le dossier ${data.id}`;
    const dateReceipt1stDemand =
      instructionTime[keyInstructionTime.DATE_RECEIPT1];
    const dateRequest1stDemand =
      instructionTime[keyInstructionTime.DATE_REQUEST1];

    if (data.state === DossierState.EnConstruction) {
      if (dateReceipt1stDemand) {
        throw Error(
          `${messageError}: Ce dossier est en construction et posséde une date de récéption de 1er demande de piéce.`,
        );
      }
      return true;
    }

    const forCheckDateReception1stDemand = {
      date: dateReceipt1stDemand,
      message: "La date de réception de pièces",
    };

    this.checkAndGetLastDates(
      {
        date: dateRequest1stDemand,
        message: "La date de demande de pièces",
      },
      forCheckDateReception1stDemand,
      `${messageError} pour la première demande:`,
    );

    if (this.isDossierClosed(data.state)) {
      return true;
    }

    if (!data.datePassageEnInstruction) {
      throw Error(`${messageError}: La date d'instruction est manquante`);
    }

    if (dateRequest1stDemand && !dateReceipt1stDemand) {
      throw Error(
        `${messageError}: La date de reception de la 1ere demande est manquante`,
      );
    }

    const dateInstruction = new Date(data.datePassageEnInstruction);
    const forCheckDateInstruction = {
      date: dateInstruction,
      message: "La date d'instruction",
    };

    if (dateReceipt1stDemand) {
      this.checkAndGetLastDates(
        forCheckDateReception1stDemand,
        forCheckDateInstruction,
        `${messageError}:`,
      );
    }

    const isOk2ndDemand = this.checkAndGetLastDates(
      {
        date: instructionTime[keyInstructionTime.DATE_REQUEST2],
        message: "La date de demande de pièces",
      },
      {
        date: instructionTime[keyInstructionTime.DATE_RECEIPT2],
        message: "La date de reception de pièces",
      },
      `${messageError} pour la deuxième demande :`,
    );

    const forDateStart = dateReceipt1stDemand
      ? forCheckDateReception1stDemand
      : forCheckDateInstruction;

    const forDateProrogation = {
      date: instructionTime[keyInstructionTime.BEGIN_PROROGATION_DATE],
      message: "La date de prorogation",
    };

    this.checkAndGetLastDates(
      forDateStart,
      forDateProrogation,
      `${messageError}`,
    );

    if (
      forDateProrogation.date &&
      dayjs(forDateProrogation.date).diff(forDateStart.date, "days") >
        this.nbDaysAfterInstruction
    ) {
      throw `${messageError} pour la date prorogation: Elle est aprés ${
        this.nbDaysAfterInstruction
      } jours par rapport à ${forDateStart.message.toLowerCase()}`;
    }

    this.checkAndGetLastDates(
      forDateProrogation,
      isOk2ndDemand || undefined,
      `${messageError} pour la date prorogation:`,
    );

    const nbDaysExtensionTotal =
      this.nbDaysAfterInstruction + this.nbDaysAfterExtension;
    if (
      isOk2ndDemand?.date &&
      dayjs(isOk2ndDemand.date).diff(forDateStart.date, "days") >
        nbDaysExtensionTotal
    ) {
      throw `${messageError} pour la date 2eme demande de piece: Elle est aprés ${nbDaysExtensionTotal} jours par rapport à ${forDateStart.message.toLowerCase()}`;
    }

    const forDateIntentionOppo = {
      date: instructionTime[keyInstructionTime.DATE_INTENT_OPPOSITION],
      message: "La date d'intention opposition",
    };

    if (instructionTime[keyInstructionTime.BEGIN_PROROGATION_DATE]) {
      this.checkAndGetLastDates(
        forDateProrogation,
        forDateIntentionOppo,
        `${messageError}: `,
      );
    }

    this.checkAndGetLastDates(
      forDateStart,
      forDateIntentionOppo,
      `${messageError}`,
    );

    return true;
  }

  async proccessByDossierId(id: number): Promise<boolean> {
    const dossier = await this.dossierService.findOneById(id, {
      dossierDS: true,
    });
    if (!dossier) {
      // TODO: à revoir
      return false;
    }

    let instructionTime = await this.findByDossierId(id);

    if (!instructionTime) {
      instructionTime = new InstructionTime();
      instructionTime.state = EInstructionTimeState.DEFAULT;
    }

    instructionTime.dossier = dossier;
    await this.proccess(instructionTime);
    return true;
  }

  async proccess(instructionTime: InstructionTime): Promise<InstructionTime> {
    const { dossier } = instructionTime;
    const { state, datePassageEnInstruction } = dossier.dossierDS.dataJson;

    if (this.isDossierClosed(state)) {
      return await this.saveIsClose(instructionTime);
    }

    const datesForInstructionTimes =
      this.getMappingInstructionTimeByDossier(dossier);

    try {
      this.checkValidity(dossier.dossierDS.dataJson, datesForInstructionTimes);
    } catch (error) {
      this.logger.error({
        short_message: `Erreur pendant la check Validity instruction time: ${dossier.id}`,
        full_message: error.stack,
      });
      instructionTime.state = EInstructionTimeState.IN_ERROR;
      return this.repo.save(instructionTime);
    }

    if (state === DossierState.EnConstruction) {
      return await this.saveInConstruction(
        instructionTime,
        datesForInstructionTimes,
      );
    }

    const delay = {} as TDelay;

    if (datesForInstructionTimes.DateIntentOpposition) {
      this.delayOpposition(datesForInstructionTimes, delay);
    } else {
      this.dalayInstruction(
        dayjs(
          datesForInstructionTimes.DateReceipt1 || datePassageEnInstruction,
        ),
        delay,
      );

      if (datesForInstructionTimes.BeginProrogationDate) {
        this.delayProrogation(datesForInstructionTimes, delay);
      }

      if (datesForInstructionTimes.DateRequest2) {
        this.delayDateRequest2(datesForInstructionTimes, delay);
      }

      if (datesForInstructionTimes.DateReceipt2) {
        this.delayDateReceipt2(datesForInstructionTimes, delay);
      }
    }
    return await this.saveInInstruction(instructionTime, delay);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private isOutOfDate(state) {
    return state === EInstructionTimeState.OUT_OF_DATE;
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private isDossierClosed(state) {
    return ![DossierState.EnConstruction, DossierState.EnInstruction].includes(
      state,
    );
  }

  private async saveInInstruction(
    instructionTime: InstructionTime,
    delay: TDelay,
  ): Promise<InstructionTime> {
    instructionTime.startAt = delay.startAt && delay.startAt.toDate();
    instructionTime.endAt = delay.endAt && delay.endAt.toDate();
    instructionTime.stopAt = delay.stopAt && delay.stopAt.toDate();
    instructionTime.state =
      [
        EInstructionTimeState.SECOND_REQUEST as EInstructionTimeStateKey,
        EInstructionTimeState.INTENT_OPPO as EInstructionTimeStateKey,
      ].includes(delay.state) || dayjs().isSameOrBefore(delay.endAt)
        ? delay.state
        : EInstructionTimeState.OUT_OF_DATE;

    return this.repo.save(instructionTime);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async saveInConstruction(instructionTime, datesForInstructionTimes) {
    if (datesForInstructionTimes[keyInstructionTime.DATE_REQUEST1]) {
      instructionTime.state = EInstructionTimeState.FIRST_REQUEST;
    }
    return await this.repo.save(instructionTime);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async saveIsClose(instructionTime) {
    //TODO: faire quelque chose
    instructionTime.state = EInstructionTimeState.DEFAULT;
    return await this.repo.save(instructionTime);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private delayDateReceipt2(
    datesForInstructionTimes: TIntructionTime,
    delay: TDelay,
  ) {
    delay.endAt = dayjs(datesForInstructionTimes.DateReceipt2)
      .startOf("day")
      .add(delay.endAt.diff(delay.stopAt, "day"), "day");

    delay.state = EInstructionTimeState.SECOND_RECEIPT;
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private delayDateRequest2(
    datesForInstructionTimes: TIntructionTime,
    delay: TDelay,
  ) {
    delay.stopAt = dayjs(datesForInstructionTimes.DateRequest2);
    delay.state = EInstructionTimeState.SECOND_REQUEST;
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private delayProrogation(
    datesForInstructionTimes: TIntructionTime,
    delay: TDelay,
  ) {
    const timeProrogation = datesForInstructionTimes.BeginProrogationDate;
    const remainingtime = delay.endAt.diff(timeProrogation, "day");
    delay.endAt = dayjs(timeProrogation)
      .add(this.nbDaysAfterExtension, "day")
      .add(remainingtime, "day");

    delay.state = EInstructionTimeState.IN_EXTENSION;
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private dalayInstruction(dateStart: Dayjs, delay: TDelay) {
    delay.startAt = dateStart;
    delay.endAt = dayjs(dateStart).add(this.nbDaysAfterInstruction, "day");
    delay.state = EInstructionTimeState.IN_PROGRESS;
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private delayOpposition(
    datesForInstructionTimes: TIntructionTime,
    delay: TDelay,
  ) {
    delay.startAt = dayjs(datesForInstructionTimes.DateIntentOpposition);
    delay.endAt = delay.startAt.add(this.nbDaysAfterIntentOpposition, "day");

    delay.state = EInstructionTimeState.INTENT_OPPO;
  }
}
