/* eslint-disable */

import { Test, TestingModule } from "@nestjs/testing";
import { InstructionTimesController } from "./instruction_times.controller";
import { InstructionTimesService } from "./instruction_times.service";
import { InstructionTime } from "../entities";
import {
  datasourceTest,
  dossier_ds_test,
  dossier_test,
} from "../../../shared/entities/__tests__";
import { instructionTime_test } from "../entities/__tests__";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import configuration from "../../../config/configuration";
import instructionTimeMappingConfig from "../config/instructionTimeMapping.config";
import { Dossier } from "../../../modules/dossiers/entities/dossier.entity";
import { DossierDS } from "../../../modules/dossiers/entities/dossier_ds.entity";
import { Demarche } from "../../../modules/demarches/entities/demarche.entity";
import { DemarcheDS } from "../../../modules/demarches/entities/demarche_ds.entity";

describe("InstructionTimesController", () => {
  let controller: InstructionTimesController;
  let service: InstructionTimesService;

  beforeEach(async () => {
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
      controllers: [InstructionTimesController],
      providers: [InstructionTimesService],
    }).compile();

    controller = module.get<InstructionTimesController>(
      InstructionTimesController,
    );
    service = module.get<InstructionTimesService>(InstructionTimesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  const dossierDs = dossier_ds_test();
  const dossier = dossier_test(dossierDs as any);
  const instructionTime = instructionTime_test(dossier as any);
  const dossierDs2 = dossier_ds_test();
  const dossier2 = dossier_test(dossierDs2 as any);
  const instructionTime2 = instructionTime_test(dossier2 as any);

  describe("findAll", () => {
    it("should return empty array", async () => {
      const result: Promise<InstructionTime[]> = [] as any;
      jest.spyOn(service, "findAll").mockImplementation(() => result);

      await expect(controller.findAll()).toEqual([]);
    });

    it("should return an array of InstructionTimes", async () => {
      const result: Promise<InstructionTime[]> = [
        instructionTime,
        instructionTime2,
      ] as any;
      jest.spyOn(service, "findAll").mockImplementation(() => result);

      await expect(controller.findAll()).toBe(result);
    });
  });

  describe("findOne", () => {
    it("should return error", async () => {
      jest
        .spyOn(service, "findOne")
        .mockRejectedValue(new Error("Unable to retrieve InstructionTime"));
      await expect(controller.findOne("0")).rejects.toThrow(
        "Unable to retrieve InstructionTime",
      );
    });

    it("should return a InstructionTimes", async () => {
      instructionTime.id = 1;
      jest
        .spyOn(service, "findOne")
        .mockImplementation(() => instructionTime as any);
      await expect(controller.findOne(instructionTime.id.toString())).toBe(
        instructionTime,
      );
    });
  });

  describe("findOneByDossierId", () => {
    it("should return error", async () => {
      jest
        .spyOn(service, "findOneByDossier")
        .mockRejectedValue(new Error("Unable to retrieve InstructionTime"));
      await expect(controller.findOneByDossierId("0")).rejects.toThrow(
        "Unable to retrieve InstructionTime",
      );
    });

    it("should return a InstructionTimes", async () => {
      instructionTime.dossier.id = 100;
      jest
        .spyOn(service, "findOneByDossier")
        .mockImplementation(() => instructionTime as any);
      await expect(
        controller.findOneByDossierId(instructionTime.dossier.id.toString()),
      ).toBe(instructionTime);
    });
  });
});
