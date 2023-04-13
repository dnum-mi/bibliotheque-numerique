import { Injectable, Logger } from "@nestjs/common";
import { InstructionTime } from "../entities";
import { LoggerService } from "../../../logger/logger.service";
import { Dossier } from "../../../entities";
import { TInstructionTimeMappingConfig } from "../config/instructionTimeMapping.config";
import { ConfigService } from "@nestjs/config";

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

  async getMappingInstructionTimeByDossierId(idDossier: number) {
    try {
      const dossier = await Dossier.findOne({
        where: { id: idDossier },
        relations: { dossierDS: true },
      });
      const instructionTimeMapping = this.configService.get<
        TInstructionTimeMappingConfig["instructionTimeMappingConfig"]
      >("instructionTimeMappingConfig");
      const annotations = dossier.dossierDS.dataJson.annotations;
      const result = {};
      for (const annotationLabelKey of Object.keys(instructionTimeMapping)) {
        const annotation = annotations.find(
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
}
