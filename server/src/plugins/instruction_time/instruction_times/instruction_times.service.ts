import { Injectable, Logger } from "@nestjs/common";
import { InstructionTime } from "../entities";
import { LoggerService } from "../../../logger/logger.service";
import { Dossier } from "../../../entities";
import { TInstructionTimeMappingConfig } from "../config/instructionTimeMapping.config";
import { ConfigService } from "@nestjs/config";
import { In } from "typeorm";
import { EInstructionTimeState } from "../types/IntructionTime.type";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";

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
}
