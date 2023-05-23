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
};

@Injectable()
export class InstructionTimesService {
  private readonly logger = new Logger(
    InstructionTimesService.name,
  ) as unknown as LoggerService;

  constructor(private configService: ConfigService) {}

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

  getMappingInstructionTimeByDossier(dossier: Dossier): any {
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
}
