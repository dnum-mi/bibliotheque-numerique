import { Injectable, Logger } from "@nestjs/common";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { InstructionTime } from "../entities";
import { LoggerService } from "../../../logger/logger.service";
import { Dossier } from "../../../entities";
import {
  TInstructionTimeMappingConfig,
  keyInstructionTime,
} from "../config/instructionTimeMapping.config";
import { ConfigService } from "@nestjs/config";
import { In } from "typeorm";
import { EInstructionTimeState } from "../types/IntructionTime.type";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";

type TIntructionTime = {
  [keyInstructionTime.DATE_REQUEST1]?: Date | null;
  [keyInstructionTime.DATE_RECEIPT1]?: Date | null;
  [keyInstructionTime.BEGIN_PROROGATION_DATE]?: Date | null;
  [keyInstructionTime.DURATION_EXTENSION]?: Date | null;
  [keyInstructionTime.DATE_REQUEST2]?: Date | null;
  [keyInstructionTime.DATE_RECEIPT2]?: Date | null;
  [keyInstructionTime.DATE_INTENT_OPPOSITION]?: Date | null;
};

@Injectable()
export class InstructionTimesService {
  private readonly logger = new Logger(
    InstructionTimesService.name,
  ) as unknown as LoggerService;

  nbJrsAfterInstruction: number;
  nbJrsAfterExtension: number;
  nbJrsAfterIntentOpposition: number;

  constructor(private configService: ConfigService) {
    const jrsInMillisecond = 1000 * 60 * 60 * 24;
    this.nbJrsAfterInstruction =
      this.configService.get("NB_JRS_AFTER_INSTRUCTION") * jrsInMillisecond;
    this.nbJrsAfterExtension =
      this.configService.get("NB_JRS_AFTER_EXTENSION") * jrsInMillisecond;
    this.nbJrsAfterIntentOpposition =
      this.configService.get("NB_JRS_AFTER_INTENT_OPPOSITION") *
      jrsInMillisecond;
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
      const dossiers = await Dossier.find({
        where: { id: In(idDossiers) },
        relations: { dossierDS: true },
      });
      return dossiers.reduce((acc: any, dossier) => {
        if (
          dossier.dossierDS?.dataJson?.state === DossierState.EnConstruction &&
          this.getMappingInstructionTimeByDossier(dossier).DateRequest1
        ) {
          acc[dossier.id] = {
            remainingTime: null,
            delayStatus: EInstructionTimeState.FIRST_REQUEST,
          };
        } else {
          acc[dossier.id] = {
            remainingTime: null,
            delayStatus: null,
          };
        }
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
      return date2;
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

    [
      {
        date: dateInstruction,
        message: "La date d'instruction",
      },
      this.checkAndGetLastDates(
        {
          date: instructionTime[keyInstructionTime.BEGIN_PROROGATION_DATE],
          message: "La date de prorogation",
        },
        isOk2ndDemand || undefined,
        `${messageError} pour la date prorogation:`,
      ),
      {
        date: instructionTime[keyInstructionTime.DATE_INTENT_OPPOSITION],
        message: "La date d'intention opposition",
      },
    ].reduce((dateRecent, cur) => {
      if (!dateRecent) return cur;
      return this.checkAndGetLastDates(dateRecent, cur, `${messageError}:`);
    });
    return true;
  }
  
  proccess(instructionTime: InstructionTime) {
    ///Hors delai => Pas de calcul
    if (instructionTime.state === EInstructionTimeState.OUT_OF_DATE)
      return false;

    const { dossier } = instructionTime;
    const { state, datePassageEnInstruction } = dossier.dossierDS.dataJson;

    if (
      ![DossierState.EnConstruction, DossierState.EnInstruction].includes(state)
    ) {
      //TODO: faire quelque chose
      instructionTime.state = undefined;
      return await instructionTime.save();
    }

    const datesForInstructionTimes =
      this.getMappingInstructionTimeByDossier(dossier);

    //TODO: Coherence des dates à ajouter

    //Check state to action
    if (state === DossierState.EnConstruction) {
      if (datesForInstructionTimes[keyInstructionTime.DATE_REQUEST1]) {
        instructionTime.state = EInstructionTimeState.FIRST_REQUEST;
      }
      return await instructionTime.save();
    }

    const delay = {} as {
      endAt: number;
      startAt: number;
      stopAt: number;
      state: string;
    };

    if (datesForInstructionTimes.DateIntentOpposition) {
      delay.endAt =
        datesForInstructionTimes.DateIntentOpposition.getTime() +
        this.nbJrsAfterIntentOpposition;
      delay.startAt = datesForInstructionTimes.DateIntentOpposition.getTime();
      delay.state = EInstructionTimeState.INTENT_OPPO;
    }

    //En intruction
    const dateInstruction = new Date(datePassageEnInstruction);
    delay.startAt = dateInstruction.getTime();
    delay.endAt = dateInstruction.getTime() + this.nbJrsAfterInstruction;
    delay.state = EInstructionTimeState.IN_PROGRESS;

    //En prorogatoin
    if (datesForInstructionTimes.BeginProrogationDate) {
      const timeProrogation =
        datesForInstructionTimes.BeginProrogationDate.getTime();
      delay.endAt =
        timeProrogation +
        this.nbJrsAfterExtension +
        (timeProrogation - delay.endAt);
      delay.startAt = timeProrogation;
      delay.state = EInstructionTimeState.IN_EXTENSION;
    }

    //2nd demande
    if (datesForInstructionTimes.DateRequest2) {
      delay.stopAt = datesForInstructionTimes.DateRequest2.getTime();
      delay.state = EInstructionTimeState.SECOND_REQUEST;
    }

    //Receipt 2nd demand
    if (datesForInstructionTimes.DateReceipt2) {
      delay.endAt =
        datesForInstructionTimes.DateReceipt2.getTime() -
        (delay.stopAt - delay.endAt);
    }

    instructionTime.startAt = delay.startAt && new Date(delay.startAt);
    instructionTime.endAt = delay.endAt && new Date(delay.endAt);
    instructionTime.stopAt = delay.stopAt && new Date(delay.stopAt);
    instructionTime.state =
      delay.state === EInstructionTimeState.SECOND_REQUEST ||
      Date.now() < delay.endAt
        ? delay.state
        : EInstructionTimeState.OUT_OF_DATE;

    instructionTime.save();
  }
}
