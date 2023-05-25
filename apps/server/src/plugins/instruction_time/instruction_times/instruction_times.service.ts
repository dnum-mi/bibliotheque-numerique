import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";
import { In } from "typeorm";

import { InstructionTime } from "../entities";
import { LoggerService } from "../../../logger/logger.service";
import { Dossier } from "../../../entities";
import {
  TInstructionTimeMappingConfig,
  keyInstructionTime,
} from "../config/instructionTimeMapping.config";
import {
  EInstructionTimeState,
  EInstructionTimeStateKey,
} from "../types/IntructionTime.type";

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
  endAt: number;
  startAt: number;
  stopAt: number;
  state: EInstructionTimeStateKey;
  isStop: boolean;
};

@Injectable()
export class InstructionTimesService {
  private readonly logger = new Logger(
    InstructionTimesService.name,
  ) as unknown as LoggerService;

  nbDaysAfterInstruction: number;
  nbDaysAfterExtension: number;
  nbDaysAfterIntentOpposition: number;
  millisecondsOfDay = 1000 * 60 * 60 * 24;

  constructor(private configService: ConfigService) {
    this.nbDaysAfterInstruction =
      this.configService.get("NB_DAYS_AFTER_INSTRUCTION") *
      this.millisecondsOfDay;
    this.nbDaysAfterExtension =
      this.configService.get("NB_DAYS_AFTER_EXTENSION") *
      this.millisecondsOfDay;
    this.nbDaysAfterIntentOpposition =
      this.configService.get("NB_DAYS_AFTER_INTENT_OPPOSITION") *
      this.millisecondsOfDay;
  }

  findAll() {
    try {
      return InstructionTime.find();
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des InstructionTime",
        full_message: error.stack,
      });
      throw new Error("Unable to retrieve InstructionTime");
    }
  }

  findOne(id: number) {
    try {
      return InstructionTime.findBy({ id: id });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des InstructionTime",
        full_message: error.stack,
      });
      throw new Error("Unable to retrieve InstructionTime");
    }
  }

  findOneByDossier(idDossier: number) {
    try {
      return InstructionTime.findByDossierId(idDossier);
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des InstructionTime",
        full_message: error.stack,
      });
      throw new Error("Unable to retrieve InstructionTime");
    }
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
      ) as any;
      if (
        annotation &&
        (annotation.datetime || annotation.date || annotation.stringValue)
      ) {
        result[annotationLabelKey] = new Date(
          annotation.datetime || annotation.date || annotation.stringValue,
        );
      } else {
        result[annotationLabelKey] = null;
      }
    }
    return result;
  }

  async getMappingInstructionTimeByDossierId(idDossier: number): Promise<any> {
    try {
      const dossier = await Dossier.findOne({
        where: { id: idDossier },
        relations: { dossierDS: true },
      });
      return this.getMappingInstructionTimeByDossier(dossier);
    } catch (error) {
      this.logger.error({
        short_message: `Échec récupération du mapping InstructionTime pour le dossier ${idDossier}`,
        full_message: error.stack,
      });
      throw new Error(
        `Unable to retrieve mappingInstructionTime for dossier ${idDossier}`,
      );
    }
  }

  async instructionTimeCalculation(idDossiers: number[]) {
    try {
      const instructionTimes = await InstructionTime.find({
        where: {
          dossier: {
            id: In(idDossiers),
          },
        },
        relations: { dossier: true },
      });

      return instructionTimes.reduce((acc: any, instructionTime) => {
        const { dossier } = instructionTime;
        const now = Date.now();
        let remainingTime = null;
        let delayStatus = null;
        if (
          [
            EInstructionTimeState.IN_EXTENSION,
            EInstructionTimeState.IN_PROGRESS,
            EInstructionTimeState.SECOND_RECEIPT as EInstructionTimeStateKey,
          ].includes(instructionTime.state)
        ) {
          remainingTime =
            (instructionTime.endAt.getTime() - now) / this.millisecondsOfDay;
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
          remainingTime =
            (instructionTime.endAt.getTime() -
              instructionTime.stopAt.getTime()) /
            this.millisecondsOfDay;
          delayStatus =
            remainingTime > 0
              ? instructionTime.state
              : EInstructionTimeState.OUT_OF_DATE;
        }

        acc[dossier.id] = {
          remainingTime: remainingTime ? Math.round(remainingTime) : null,
          delayStatus: delayStatus ?? instructionTime.state ?? null,
        };

        return acc;
      }, {});
    } catch (error) {
      this.logger.error({
        short_message: "Échec calcul des InstructionTime",
        full_message: error.stack,
      });
      throw new Error("Unable to calculate InstructionTime");
    }
  }

  checkAndGetLastDates(
    date1: { date: Date | undefined | null; message: string },
    date2: { date: Date | undefined | null; message: string },
    messageError: string,
  ) {
    const dateReceipt = date2?.date;
    const dateDemand = date1?.date;
    if (dateReceipt && !dateDemand) {
      throw new Error(
        `${messageError} ${
          date1?.message || "La premiére date"
        } est manaquante`,
      );
    }

    if (!dateDemand) return undefined;

    if (!dateReceipt) return date1;

    if (dateDemand.getTime() <= dateReceipt.getTime()) {
      return date1;
    }

    throw new Error(
      `${messageError} ${
        date2?.message || "la seconde date"
      } est plus ancienne que ${date1?.message || "le première date"}`,
    );
  }

  checkValidity(data: Partial<TDossier>, instructionTime: TIntructionTime) {
    const messageError = "Erreur dans les déclarations de dates";

    this.checkAndGetLastDates(
      {
        date: instructionTime[keyInstructionTime.DATE_REQUEST1],
        message: "La date de demande de pièces",
      },
      {
        date: instructionTime[keyInstructionTime.DATE_RECEIPT1],
        message: "La date de réception de pièces",
      },
      `${messageError} pour la première demande:`,
    );

    if (data.state !== DossierState.EnInstruction) {
      return true;
    }

    if (!data.datePassageEnInstruction) {
      throw Error(`${messageError}: La date d'instruction est manquante`);
    }

    const dateInstruction = new Date(data.datePassageEnInstruction);

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

    const forDateInstruction = {
      date: dateInstruction,
      message: "La date d'instruction",
    };

    const forDateProrogation = {
      date: instructionTime[keyInstructionTime.BEGIN_PROROGATION_DATE],
      message: "La date de prorogation",
    };

    const forDateIntentionOppo = {
      date: instructionTime[keyInstructionTime.DATE_INTENT_OPPOSITION],
      message: "La date d'intention opposition",
    };

    this.checkAndGetLastDates(
      forDateInstruction,
      forDateProrogation,
      `${messageError}`,
    );

    this.checkAndGetLastDates(
      forDateProrogation,
      isOk2ndDemand || undefined,
      `${messageError} pour la date prorogation:`,
    );

    if (instructionTime[keyInstructionTime.BEGIN_PROROGATION_DATE]) {
      this.checkAndGetLastDates(
        forDateProrogation,
        forDateIntentionOppo,
        `${messageError}: `,
      );
    }

    this.checkAndGetLastDates(
      forDateInstruction,
      forDateIntentionOppo,
      `${messageError}`,
    );

    return true;
  }

  async proccessByDossierId(id: number) {
    const dossier = await Dossier.findOne({
      where: { id: id },
      relations: { dossierDS: true },
    });
    if (!dossier) {
      // TODO: à revoir
      return false;
    }

    let instructionTime = await InstructionTime.findByDossierId(id);

    if (!instructionTime) {
      instructionTime = new InstructionTime();
      instructionTime.state = EInstructionTimeState.DEFAULT;
    }

    instructionTime.dossier = dossier;
    await this.proccess(instructionTime);
    return true;
  }

  async proccess(instructionTime: InstructionTime) {
    if (this.isOutOfDate(instructionTime.state)) return false;

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
        short_message: `Erreur pendant la check Validity instruction time: ${dossier.id.toString()}`,
        full_message: error.stack,
      });
      instructionTime.state = EInstructionTimeState.IN_ERROR;
      return await instructionTime.save();
    }

    if (state === DossierState.EnConstruction) {
      return await this.saveInConstruction(
        instructionTime,
        datesForInstructionTimes,
      );
    }

    const delay = {} as TDelay;

    if (datesForInstructionTimes.DateIntentOpposition) {
      this.delayOpposition(delay, datesForInstructionTimes);
    } else {
      this.dalayInstruction(datePassageEnInstruction, delay);

      if (datesForInstructionTimes.BeginProrogationDate) {
        this.delayProrogation(datesForInstructionTimes, delay);
      }

      if (datesForInstructionTimes.DateRequest2) {
        this.delayDateRequest2(delay, datesForInstructionTimes);
      }

      if (datesForInstructionTimes.DateReceipt2) {
        this.delayDateReceipt2(delay, datesForInstructionTimes);
      }
    }
    return await this.saveInInstruction(instructionTime, delay);
  }

  private isOutOfDate(state) {
    return state === EInstructionTimeState.OUT_OF_DATE;
  }

  private isDossierClosed(state) {
    return ![DossierState.EnConstruction, DossierState.EnInstruction].includes(
      state,
    );
  }

  private async saveInInstruction(
    instructionTime: InstructionTime,
    delay: TDelay,
  ) {
    instructionTime.startAt = delay.startAt && new Date(delay.startAt);
    instructionTime.endAt = delay.endAt && new Date(delay.endAt);
    instructionTime.stopAt = delay.stopAt && new Date(delay.stopAt);
    instructionTime.state =
      [
        EInstructionTimeState.SECOND_REQUEST,
        EInstructionTimeState.INTENT_OPPO as EInstructionTimeStateKey,
      ].includes(delay.state) || Date.now() < delay.endAt
        ? delay.state
        : EInstructionTimeState.OUT_OF_DATE;

    return await instructionTime.save();
  }

  private async saveInConstruction(instructionTime, datesForInstructionTimes) {
    if (datesForInstructionTimes[keyInstructionTime.DATE_REQUEST1]) {
      instructionTime.state = EInstructionTimeState.FIRST_REQUEST;
    }
    return await instructionTime.save();
  }

  private async saveIsClose(instructionTime) {
    //TODO: faire quelque chose
    instructionTime.state = EInstructionTimeState.DEFAULT;
    return await instructionTime.save();
  }

  private delayDateReceipt2(
    delay: TDelay,
    datesForInstructionTimes: TIntructionTime,
  ) {
    delay.endAt =
      datesForInstructionTimes.DateReceipt2.getTime() -
      (delay.stopAt - delay.endAt);
    delay.state = EInstructionTimeState.SECOND_RECEIPT;
  }

  private delayDateRequest2(
    delay: TDelay,
    datesForInstructionTimes: TIntructionTime,
  ) {
    delay.stopAt = datesForInstructionTimes.DateRequest2.getTime();
    delay.state = EInstructionTimeState.SECOND_REQUEST;
  }

  private delayProrogation(
    datesForInstructionTimes: TIntructionTime,
    delay: TDelay,
  ) {
    const timeProrogation =
      datesForInstructionTimes.BeginProrogationDate.getTime();
    delay.endAt =
      timeProrogation +
      this.nbDaysAfterExtension +
      (delay.endAt - timeProrogation);
    delay.state = EInstructionTimeState.IN_EXTENSION;
  }

  private dalayInstruction(datePassageEnInstruction, delay: TDelay) {
    const dateInstruction = new Date(datePassageEnInstruction);
    delay.startAt = dateInstruction.getTime();
    delay.endAt = dateInstruction.getTime() + this.nbDaysAfterInstruction;
    delay.state = EInstructionTimeState.IN_PROGRESS;
  }

  private delayOpposition(
    delay: TDelay,
    datesForInstructionTimes: TIntructionTime,
  ) {
    delay.endAt =
      datesForInstructionTimes.DateIntentOpposition.getTime() +
      this.nbDaysAfterIntentOpposition;
    delay.startAt = datesForInstructionTimes.DateIntentOpposition.getTime();
    delay.state = EInstructionTimeState.INTENT_OPPO;
  }
}
